export type TournamentStatus = "draft" | "active" | "finished";
export type ParticipantStatus = "joined" | "in_progress" | "finished";

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  name: string;
  completedLevels: number;
  totalDurationMs: number;
  totalMoves: number;
  status: ParticipantStatus;
  finishedAt: Date | null;
};
