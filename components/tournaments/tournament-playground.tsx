"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { startParticipantTournamentAction } from "@/app/actions/tournament";
import { HanoiGame } from "@/components/game/hanoi-game";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useTournamentSocket } from "@/hooks/use-tournament-socket";
import { getParticipantStatusLabel } from "@/lib/labels";
import { formatDuration } from "@/lib/utils";

type TournamentPlaygroundProps = {
  tournamentId: string;
  status: "draft" | "active" | "finished";
  levels: Array<{
    id: string;
    orderIndex: number;
    jsonLevelId: number;
    parsedLevel: any;
  }>;
  participant: {
    currentLevelIndex: number;
    completedLevels: number;
    totalDurationMs: number;
    totalMoves: number;
    status: "joined" | "in_progress" | "finished";
    levelResults: Array<{
      tournamentLevelId: string;
      orderIndex: number;
      durationMs: number;
      moves: number;
    }>;
  } | null;
};

export function TournamentPlayground({ tournamentId, status, levels, participant }: TournamentPlaygroundProps) {
  const router = useRouter();
  const tick = useTournamentSocket(tournamentId);
  const [isStarting, startTransition] = useTransition();
  const [selectedIndex, setSelectedIndex] = useState(participant?.currentLevelIndex ?? 0);

  useEffect(() => {
    const shouldPauseRefresh =
      typeof window !== "undefined" &&
      Boolean((window as typeof window & { __hanoiPauseTournamentRefresh?: boolean }).__hanoiPauseTournamentRefresh);

    if (tick > 0 && !shouldPauseRefresh) {
      router.refresh();
    }
  }, [router, tick]);

  useEffect(() => {
    setSelectedIndex(participant?.currentLevelIndex ?? 0);
  }, [participant?.currentLevelIndex]);

  if (!participant) {
    return <Alert variant="info" message="Приєднайтеся до турніру за кодом, щоб відкрити його й почати проходження." />;
  }

  if (participant.status === "joined") {
    return (
      <div className="space-y-6">
        <div className="panel space-y-4 p-6 text-center">
          <h2 className="font-display text-3xl font-black text-slate-900">Ви вже в турнірі</h2>
          <p className="mx-auto max-w-2xl text-slate-600">
            Натисніть `Старт`, щоб відкрити перший рівень і запустити відлік часу.
          </p>
          <div className="flex justify-center">
            <Button
              type="button"
              disabled={isStarting}
              onClick={() =>
                startTransition(async () => {
                  await startParticipantTournamentAction(tournamentId);
                  router.refresh();
                })
              }
            >
              {isStarting ? "Запускаємо..." : "Старт"}
            </Button>
          </div>
        </div>

        <div className="panel space-y-4 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-brand-50 text-brand-700">Статус: {getParticipantStatusLabel(participant.status)}</Badge>
            <Badge>Рівнів у турнірі: {levels.length}</Badge>
          </div>
          <ProgressBar value={participant.completedLevels} total={levels.length} />
        </div>
      </div>
    );
  }

  const currentLevel = levels[selectedIndex];
  const completedResult = participant.levelResults.find((result) => result.tournamentLevelId === currentLevel?.id);
  const isCompletedTab = Boolean(completedResult);
  const isCurrentTab = selectedIndex === participant.currentLevelIndex && participant.status !== "finished";

  return (
    <div className="space-y-6">
      <div className="panel space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="bg-brand-50 text-brand-700">Статус: {getParticipantStatusLabel(participant.status)}</Badge>
          <Badge className="bg-ocean-50 text-ocean-700">Усього ходів: {participant.totalMoves}</Badge>
          <Badge>Час: {formatDuration(participant.totalDurationMs)}</Badge>
        </div>
        <ProgressBar value={participant.completedLevels} total={levels.length} />
      </div>

      <div className="flex flex-wrap gap-3">
        {levels.map((level, index) => {
          const completed = participant.levelResults.some((result) => result.tournamentLevelId === level.id);
          const locked = !completed && index > participant.currentLevelIndex;
          return (
            <button
              key={level.id}
              type="button"
              disabled={locked}
              onClick={() => setSelectedIndex(index)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${selectedIndex === index ? "bg-brand-500 text-white" : completed ? "bg-emerald-100 text-emerald-700" : locked ? "bg-slate-200 text-slate-400" : "bg-white text-slate-700 ring-1 ring-slate-200"}`}
            >
              {index + 1}. #{level.jsonLevelId}
            </button>
          );
        })}
      </div>

      {isCompletedTab && completedResult ? (
        <div className="panel p-6">
          <h3 className="font-display text-2xl font-black text-slate-900">Рівень уже завершено</h3>
          <p className="mt-2 text-slate-600">Цей етап більше не можна змінити або пройти повторно.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Badge className="bg-brand-50 text-brand-700">Час: {formatDuration(completedResult.durationMs)}</Badge>
            <Badge className="bg-ocean-50 text-ocean-700">Ходи: {completedResult.moves}</Badge>
          </div>
        </div>
      ) : null}

      {isCurrentTab && currentLevel?.parsedLevel ? (
        <HanoiGame
          level={currentLevel.parsedLevel}
          heading={`Турнірний рівень ${selectedIndex + 1}`}
          description={`JSON-рівень #${currentLevel.jsonLevelId}. Після натискання «Старт» час іде одразу.`}
          mode="tournament"
          startTimerOnMount
          tournamentContext={{
            tournamentId,
            tournamentLevelId: currentLevel.id,
          }}
        />
      ) : null}

      {!isCompletedTab && !isCurrentTab ? (
        <Alert variant="info" message="Цей рівень ще заблокований або стане доступним пізніше." />
      ) : null}
    </div>
  );
}
