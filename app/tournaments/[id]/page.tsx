import { notFound } from "next/navigation";

import { LeaderboardTable } from "@/components/tournaments/leaderboard-table";
import { TournamentPlayground } from "@/components/tournaments/tournament-playground";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getParticipantStatusLabel, getTournamentStatusLabel } from "@/lib/labels";
import { getTournamentDetails } from "@/services/tournament-service";

export default async function TournamentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const tournament = await getTournamentDetails(id, user.id);

  if (!tournament) {
    notFound();
  }

  return (
    <main className="page-shell space-y-8 py-8">
      <section className="panel p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-brand-50 text-brand-700">Код: {tournament.code}</Badge>
              <Badge className="bg-ocean-50 text-ocean-700">Статус: {getTournamentStatusLabel(tournament.status)}</Badge>
            </div>
            <h1 className="mt-4 font-display text-4xl font-black text-slate-900">{tournament.name}</h1>
            <p className="mt-3 max-w-3xl text-slate-600">Рівнів у турнірі: {tournament.levels.length}. Учасників: {tournament.participants.length}.</p>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <TournamentPlayground
          tournamentId={tournament.id}
          status={tournament.status}
          levels={tournament.levels}
          participant={
            tournament.currentParticipant
              ? {
                  currentLevelIndex: tournament.currentParticipant.currentLevelIndex,
                  completedLevels: tournament.currentParticipant.completedLevels,
                  totalDurationMs: tournament.currentParticipant.totalDurationMs,
                  totalMoves: tournament.currentParticipant.totalMoves,
                  status: tournament.currentParticipant.status,
                  levelResults: tournament.currentParticipant.levelResults,
                }
              : null
          }
        />

        <div className="grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
          <Card>
            <h2 className="font-display text-2xl font-black text-slate-900">Учасники</h2>
            <div className="mt-4 space-y-3">
              {tournament.participants.map((participant) => (
                <div key={participant.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-bold text-slate-900">{participant.user.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{getParticipantStatusLabel(participant.status)}</p>
                </div>
              ))}
            </div>
          </Card>

          <div>
            <h2 className="mb-4 font-display text-2xl font-black text-slate-900">Leaderboard</h2>
            <LeaderboardTable entries={tournament.leaderboard} />
          </div>
        </div>
      </section>
    </main>
  );
}
