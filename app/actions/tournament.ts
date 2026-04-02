"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createTournament,
  joinTournamentByCode,
  startParticipantTournament,
  submitTournamentLevelResult,
} from "@/services/tournament-service";
import type { FormState } from "@/types";

const createTournamentSchema = z.object({
  name: z.string().trim().min(3, "Назва турніру має містити щонайменше 3 символи."),
  levelIds: z.array(z.number().int().positive()).min(1, "Оберіть хоча б один рівень."),
});

const joinTournamentSchema = z.object({
  code: z.string().trim().min(4, "Введіть код турніру.").max(12),
});

export async function createTournamentAction(_: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole("admin");

  let levelIds: number[] = [];
  const rawLevelIds = formData.get("levelIds");
  if (typeof rawLevelIds === "string") {
    try {
      levelIds = JSON.parse(rawLevelIds) as number[];
    } catch {
      levelIds = [];
    }
  }

  const parsed = createTournamentSchema.safeParse({
    name: formData.get("name"),
    levelIds,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Не вдалося створити турнір.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const tournament = await createTournament({
    adminId: admin.id,
    name: parsed.data.name,
    levelIds: parsed.data.levelIds,
  });

  revalidatePath("/admin/tournaments");
  redirect(`/admin/tournaments?created=${tournament.id}`);
}

export async function joinTournamentAction(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRole("child");

  const parsed = joinTournamentSchema.safeParse({
    code: formData.get("code"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Перевірте код турніру.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const participant = await joinTournamentByCode({
      code: parsed.data.code,
      userId: user.id,
    });

    revalidatePath("/tournaments");
    redirect(`/tournaments/${participant.tournamentId}`);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Не вдалося приєднатися до турніру.",
    };
  }
}

export async function submitTournamentLevelResultAction(payload: {
  tournamentId: string;
  tournamentLevelId: string;
  durationMs: number;
  moves: number;
}) {
  const user = await requireUser();

  await submitTournamentLevelResult({
    tournamentId: payload.tournamentId,
    tournamentLevelId: payload.tournamentLevelId,
    userId: user.id,
    durationMs: payload.durationMs,
    moves: payload.moves,
  });

  const tournament = await prisma.tournament.findUnique({
    where: { id: payload.tournamentId },
    include: {
      participants: {
        where: { userId: user.id },
      },
      levels: true,
    },
  });

  revalidatePath(`/tournaments`);
  revalidatePath(`/profile`);

  return {
    success: true,
    finished:
      tournament?.participants[0]?.completedLevels === tournament?.levels.length,
  };
}

export async function startParticipantTournamentAction(tournamentId: string) {
  const user = await requireRole("child");
  await startParticipantTournament({
    tournamentId,
    userId: user.id,
  });

  revalidatePath(`/tournaments`);
  revalidatePath(`/tournaments/${tournamentId}`);
}
