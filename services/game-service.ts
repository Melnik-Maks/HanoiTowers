import { prisma } from "@/lib/prisma";
import type { GameCompletionPayload } from "@/types";

export async function saveGameResult(userId: string, payload: GameCompletionPayload) {
  return prisma.gameResult.create({
    data: {
      userId,
      source: payload.source,
      jsonLevelId: payload.levelId ?? null,
      classicDisks: payload.classicDisks ?? null,
      durationMs: payload.durationMs,
      moves: payload.moves,
    },
  });
}
