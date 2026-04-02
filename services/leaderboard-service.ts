import { prisma } from "@/lib/prisma";
import type { LeaderboardEntry } from "@/types";

export async function getTournamentLeaderboard(tournamentId: string): Promise<LeaderboardEntry[]> {
  const participants = await prisma.tournamentParticipant.findMany({
    where: { tournamentId },
    include: {
      user: true,
      tournament: {
        include: {
          levels: true,
        },
      },
    },
  });

  const totalLevels = participants[0]?.tournament.levels.length ?? 0;

  const sorted = [...participants].sort((a, b) => {
    const aFinished = a.completedLevels === totalLevels;
    const bFinished = b.completedLevels === totalLevels;

    if (aFinished !== bFinished) {
      return aFinished ? -1 : 1;
    }

    if (aFinished && bFinished) {
      if (a.totalDurationMs !== b.totalDurationMs) {
        return a.totalDurationMs - b.totalDurationMs;
      }

      if (a.totalMoves !== b.totalMoves) {
        return a.totalMoves - b.totalMoves;
      }
    }

    if (a.completedLevels !== b.completedLevels) {
      return b.completedLevels - a.completedLevels;
    }

    if (a.totalDurationMs !== b.totalDurationMs) {
      return a.totalDurationMs - b.totalDurationMs;
    }

    return a.totalMoves - b.totalMoves;
  });

  return sorted.map((participant, index) => ({
    rank: index + 1,
    userId: participant.userId,
    name: participant.user.name,
    completedLevels: participant.completedLevels,
    totalDurationMs: participant.totalDurationMs,
    totalMoves: participant.totalMoves,
    status: participant.status,
    finishedAt: participant.finishedAt,
  }));
}
