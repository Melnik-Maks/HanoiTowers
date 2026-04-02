"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { saveGameResult } from "@/services/game-service";
import type { GameCompletionPayload } from "@/types";

export async function saveGameResultAction(payload: GameCompletionPayload) {
  const user = await requireUser();
  await saveGameResult(user.id, payload);
  revalidatePath("/dashboard");
  revalidatePath("/profile");

  return { success: true };
}
