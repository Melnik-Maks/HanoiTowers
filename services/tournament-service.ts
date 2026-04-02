import { ParticipantStatus, TournamentStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { emitTournamentUpdate } from "@/lib/realtime";
import { getTournamentLeaderboard } from "@/services/leaderboard-service";
import { getLevelById } from "@/services/levels-service";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(length = 6) {
  return Array.from({ length }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join("");
}

export async function generateUniqueTournamentCode() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = generateCode();
    const exists = await prisma.tournament.findUnique({ where: { code } });

    if (!exists) {
      return code;
    }
  }

  throw new Error("Не вдалося згенерувати унікальний код турніру.");
}

export async function createTournament(input: {
  adminId: string;
  name: string;
  levelIds: number[];
}) {
  if (!input.levelIds.length) {
    throw new Error("Турнір не можна створити без рівнів.");
  }

  for (const levelId of input.levelIds) {
    const level = await getLevelById(levelId);
    if (!level) {
      throw new Error(`Рівень ${levelId} не знайдено.`);
    }
  }

  const code = await generateUniqueTournamentCode();
  const startedAt = new Date();

  return prisma.tournament.create({
    data: {
      name: input.name,
      code,
      createdById: input.adminId,
      status: TournamentStatus.active,
      startedAt,
      levels: {
        create: input.levelIds.map((levelId, index) => ({
          jsonLevelId: levelId,
          orderIndex: index,
        })),
      },
    },
    include: {
      levels: {
        orderBy: {
          orderIndex: "asc",
        },
      },
    },
  });
}

export async function listTournamentsForUser(userId: string, role: "child" | "admin") {
  return prisma.tournament.findMany({
    where:
      role === "admin"
        ? { createdById: userId }
        : {
            participants: {
              some: {
                userId,
              },
            },
          },
    include: {
      levels: true,
      participants: {
        include: {
          user: true,
        },
      },
    },
    orderBy: [{ createdAt: "desc" }],
  });
}

export async function joinTournamentByCode(input: { code: string; userId: string }) {
  const tournament = await prisma.tournament.findUnique({
    where: {
      code: input.code.toUpperCase(),
    },
    include: {
      participants: true,
    },
  });

  if (!tournament) {
    throw new Error("Турнір з таким кодом не знайдено.");
  }

  if (tournament.status === TournamentStatus.finished) {
    throw new Error("До цього турніру більше не можна приєднатися.");
  }

  const existingParticipant = tournament.participants.find((participant) => participant.userId === input.userId);
  if (existingParticipant) {
    return existingParticipant;
  }

  const participant = await prisma.tournamentParticipant.create({
    data: {
      tournamentId: tournament.id,
      userId: input.userId,
      status: ParticipantStatus.joined,
    },
  });

  emitTournamentUpdate(tournament.id, "tournament:updated", { tournamentId: tournament.id });

  return participant;
}

export async function startParticipantTournament(input: { tournamentId: string; userId: string }) {
  const participant = await prisma.tournamentParticipant.findFirst({
    where: {
      tournamentId: input.tournamentId,
      userId: input.userId,
    },
    include: {
      tournament: {
        include: {
          levels: true,
        },
      },
    },
  });

  if (!participant) {
    throw new Error("Ви не є учасником цього турніру.");
  }

  if (!participant.tournament.levels.length) {
    throw new Error("У турнірі немає рівнів.");
  }

  if (participant.tournament.status !== TournamentStatus.active) {
    throw new Error("Турнір недоступний для проходження.");
  }

  if (participant.status === ParticipantStatus.finished) {
    throw new Error("Ви вже завершили цей турнір.");
  }

  if (participant.status === ParticipantStatus.in_progress) {
    return participant;
  }

  const updatedParticipant = await prisma.tournamentParticipant.update({
    where: { id: participant.id },
    data: {
      status: ParticipantStatus.in_progress,
      startedAt: new Date(),
    },
  });

  emitTournamentUpdate(input.tournamentId, "tournament:updated", { tournamentId: input.tournamentId });

  return updatedParticipant;
}

export async function getTournamentDetails(tournamentId: string, userId?: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      createdBy: true,
      levels: {
        orderBy: {
          orderIndex: "asc",
        },
      },
      participants: {
        include: {
          user: true,
          levelResults: true,
        },
      },
    },
  });

  if (!tournament) {
    return null;
  }

  const levels = await Promise.all(
    tournament.levels.map(async (level) => ({
      ...level,
      parsedLevel: await getLevelById(level.jsonLevelId),
    })),
  );

  const leaderboard = await getTournamentLeaderboard(tournament.id);

  return {
    ...tournament,
    levels,
    leaderboard,
    currentParticipant: userId
      ? tournament.participants.find((participant) => participant.userId === userId) ?? null
      : null,
  };
}

export async function submitTournamentLevelResult(input: {
  tournamentId: string;
  userId: string;
  tournamentLevelId: string;
  durationMs: number;
  moves: number;
}) {
  const participant = await prisma.tournamentParticipant.findFirst({
    where: {
      tournamentId: input.tournamentId,
      userId: input.userId,
    },
    include: {
      tournament: {
        include: {
          levels: {
            orderBy: {
              orderIndex: "asc",
            },
          },
        },
      },
      levelResults: true,
    },
  });

  if (!participant) {
    throw new Error("Ви не є учасником цього турніру.");
  }

  if (participant.tournament.status !== TournamentStatus.active) {
    throw new Error("Турнір ще не запущений.");
  }

  if (participant.status === ParticipantStatus.joined) {
    throw new Error("Спочатку натисніть «Старт» у турнірі.");
  }

  const level = participant.tournament.levels.find((item) => item.id === input.tournamentLevelId);
  if (!level) {
    throw new Error("Рівень турніру не знайдено.");
  }

  if (level.orderIndex !== participant.currentLevelIndex) {
    throw new Error("Зараз не можна завершити цей рівень.");
  }

  const alreadyDone = participant.levelResults.some((result) => result.tournamentLevelId === level.id);
  if (alreadyDone) {
    throw new Error("Цей рівень уже завершено.");
  }

  const completedLevels = participant.completedLevels + 1;
  const finished = completedLevels === participant.tournament.levels.length;

  await prisma.$transaction([
    prisma.tournamentLevelResult.create({
      data: {
        tournamentId: input.tournamentId,
        participantId: participant.id,
        tournamentLevelId: level.id,
        jsonLevelId: level.jsonLevelId,
        orderIndex: level.orderIndex,
        durationMs: input.durationMs,
        moves: input.moves,
      },
    }),
    prisma.tournamentParticipant.update({
      where: { id: participant.id },
      data: {
        completedLevels,
        currentLevelIndex: finished ? participant.currentLevelIndex : participant.currentLevelIndex + 1,
        totalDurationMs: participant.totalDurationMs + input.durationMs,
        totalMoves: participant.totalMoves + input.moves,
        status: finished ? ParticipantStatus.finished : ParticipantStatus.in_progress,
        finishedAt: finished ? new Date() : null,
      },
    }),
  ]);

  emitTournamentUpdate(input.tournamentId, "tournament:updated", { tournamentId: input.tournamentId });
}
