"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { saveGameResultAction } from "@/app/actions/game";
import { submitTournamentLevelResultAction } from "@/app/actions/tournament";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CompletionModal } from "@/components/ui/completion-modal";
import { formatDuration } from "@/lib/utils";
import type { JsonLevelShape, ParsedLevel, RodId } from "@/types";

type HanoiGameProps = {
  level: ParsedLevel;
  heading: string;
  description?: string;
  mode: "standard" | "tournament";
  classicDisks?: number | null;
  startTimerOnMount?: boolean;
  tournamentContext?: {
    tournamentId: string;
    tournamentLevelId: string;
  };
};

function cloneRods(rods: JsonLevelShape): JsonLevelShape {
  return {
    st1: [...rods.st1],
    st2: [...rods.st2],
    st3: [...rods.st3],
  };
}

function sameState(a: JsonLevelShape, b: JsonLevelShape) {
  return ["st1", "st2", "st3"].every((rodId) => JSON.stringify(a[rodId as RodId]) === JSON.stringify(b[rodId as RodId]));
}

function moveDisk(rods: JsonLevelShape, from: RodId, to: RodId) {
  const source = rods[from];
  const target = rods[to];
  const movingDisk = source[source.length - 1];

  if (movingDisk === undefined) {
    return null;
  }

  const targetTop = target[target.length - 1];
  if (targetTop !== undefined && movingDisk > targetTop) {
    return null;
  }

  const next = cloneRods(rods);
  next[from].pop();
  next[to].push(movingDisk);
  return next;
}

export function HanoiGame({
  level,
  heading,
  description,
  mode,
  classicDisks,
  startTimerOnMount = false,
  tournamentContext,
}: HanoiGameProps) {
  const router = useRouter();
  const levelResetKey =
    tournamentContext?.tournamentLevelId ??
    `${level.source}:${level.id ?? classicDisks ?? "base"}`;
  const [rods, setRods] = useState<JsonLevelShape>(cloneRods(level.rods));
  const [selectedRod, setSelectedRod] = useState<RodId | null>(null);
  const [invalidRod, setInvalidRod] = useState<RodId | null>(null);
  const [moves, setMoves] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [shouldRefreshOnClose, setShouldRefreshOnClose] = useState(false);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    (window as typeof window & { __hanoiPauseTournamentRefresh?: boolean }).__hanoiPauseTournamentRefresh =
      showCompletion || isSaving;

    return () => {
      (window as typeof window & { __hanoiPauseTournamentRefresh?: boolean }).__hanoiPauseTournamentRefresh = false;
    };
  }, [isSaving, showCompletion]);

  useEffect(() => {
    setRods(cloneRods(level.rods));
    setSelectedRod(null);
    setInvalidRod(null);
    setMoves(0);
    setElapsedMs(0);
    setStatusMessage(null);
    setShowCompletion(false);
    setIsSaving(false);
    setShouldRefreshOnClose(false);
    setIsTimerRunning(startTimerOnMount);
    startedAtRef.current = startTimerOnMount ? Date.now() : null;
  }, [levelResetKey, startTimerOnMount]);

  useEffect(() => {
    if (!isTimerRunning) {
      return;
    }

    if (startedAtRef.current === null) {
      startedAtRef.current = Date.now() - elapsedMs;
    }

    const timer = window.setInterval(() => {
      if (startedAtRef.current !== null) {
        setElapsedMs(Date.now() - startedAtRef.current);
      }
    }, 50);

    return () => window.clearInterval(timer);
  }, [isTimerRunning]);

  useEffect(() => {
    if (!invalidRod) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setInvalidRod((current) => (current === invalidRod ? null : current));
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [invalidRod]);

  const resetGame = () => {
    setRods(cloneRods(level.rods));
    setSelectedRod(null);
    setInvalidRod(null);
    setMoves(0);
    setElapsedMs(0);
    setStatusMessage(null);
    setShowCompletion(false);
    setIsTimerRunning(false);
    setIsSaving(false);
    setShouldRefreshOnClose(false);
    startedAtRef.current = null;
  };

  const saveResult = async (durationMs: number, totalMoves: number) => {
    setIsSaving(true);
    let saved = false;
    try {
      if (mode === "tournament" && tournamentContext) {
        await submitTournamentLevelResultAction({
          tournamentId: tournamentContext.tournamentId,
          tournamentLevelId: tournamentContext.tournamentLevelId,
          durationMs,
          moves: totalMoves,
        });
      } else {
        await saveGameResultAction({
          source: level.source,
          levelId: level.id,
          classicDisks: classicDisks ?? null,
          durationMs,
          moves: totalMoves,
        });
      }
      saved = true;
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Не вдалося зберегти результат.");
    } finally {
      setIsSaving(false);
      setShouldRefreshOnClose(saved);
    }
  };

  const completeGame = async (nextMoves: number) => {
    const finalElapsed = startedAtRef.current ? Date.now() - startedAtRef.current : elapsedMs;
    setElapsedMs(finalElapsed);
    setShowCompletion(true);
    setIsTimerRunning(false);
    setStatusMessage(null);
    await saveResult(finalElapsed, nextMoves);
  };

  const handleRodClick = async (rodId: RodId) => {
    if (showCompletion || isSaving) {
      return;
    }

    if (!selectedRod) {
      if (rods[rodId].length === 0) {
        return;
      }

      setInvalidRod(null);
      setSelectedRod(rodId);
      return;
    }

    if (selectedRod === rodId) {
      setSelectedRod(null);
      setInvalidRod(null);
      setStatusMessage(null);
      return;
    }

    const next = moveDisk(rods, selectedRod, rodId);
    if (!next) {
      setSelectedRod(null);
      setInvalidRod(rodId);
      return;
    }

    const nextMoves = moves + 1;
    if (startedAtRef.current === null) {
      startedAtRef.current = Date.now();
      setIsTimerRunning(true);
    }

    setRods(next);
    setMoves(nextMoves);
    setSelectedRod(null);
    setInvalidRod(null);
    setStatusMessage(null);

    if (sameState(next, level.goal)) {
      await completeGame(nextMoves);
    }
  };

  const maxDisc = Math.max(...level.allDiscs, 1);
  const uniqueDiscSizes = Array.from(new Set(level.allDiscs)).sort((a, b) => a - b);
  const discCount = level.allDiscs.length;
  const discHeight = discCount >= 18 ? 10 : discCount >= 14 ? 12 : discCount >= 10 ? 16 : discCount >= 8 ? 20 : 26;
  const discGap = discCount >= 18 ? 2 : discCount >= 14 ? 3 : discCount >= 10 ? 4 : 6;
  const boardHeight = Math.max(320, Math.min(620, discCount * (discHeight + discGap) + 150));
  const stemHeight = Math.max(200, boardHeight - 92);

  return (
    <div className="space-y-6">
      <div className="panel p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-black text-slate-900">{heading}</h1>
            {description ? <p className="mt-2 max-w-3xl text-slate-600">{description}</p> : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
                Час: {formatDuration(elapsedMs)}
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
                Ходи: {moves}
              </div>
            </div>
          </div>
          <Button type="button" variant="ghost" onClick={resetGame} disabled={isSaving || (mode === "tournament" && showCompletion)}>
            Скинути
          </Button>
        </div>
      </div>

      {statusMessage ? <Alert variant={statusMessage.includes("Не ") || statusMessage.includes("не ") ? "error" : "info"} message={statusMessage} /> : null}

      <div className="panel grid gap-3 p-3 sm:gap-4 sm:p-4 md:grid-cols-3 md:p-6">
        {(["st1", "st2", "st3"] as RodId[]).map((rodId) => (
          <button
            key={rodId}
            type="button"
            onClick={() => void handleRodClick(rodId)}
            className={`rounded-[2rem] border p-3 text-left transition sm:p-4 ${
              invalidRod === rodId
                ? "border-rose-300 bg-rose-50 shadow-[0_0_0_8px_rgba(251,113,133,0.14)]"
                : selectedRod === rodId
                  ? "border-brand-400 bg-brand-50 shadow-glow"
                  : "border-slate-200 bg-slate-50 hover:border-ocean-300 hover:bg-white"
            }`}
          >
            <div
              className="relative flex flex-col justify-end overflow-hidden rounded-[1.5rem] bg-gradient-to-b from-slate-100 via-white to-slate-50 px-2 pb-3 pt-4 sm:px-3"
              style={{ minHeight: `${boardHeight}px` }}
            >
              <div className="pointer-events-none absolute inset-x-0 bottom-7 flex justify-center">
                <div className="w-3 rounded-full bg-slate-300" style={{ height: `${stemHeight}px` }} />
              </div>

              <div
                className="relative z-10 flex flex-col justify-end"
                style={{
                  minHeight: `${stemHeight}px`,
                  gap: `${discGap}px`,
                }}
              >
                {[...rods[rodId]].reverse().map((disc, index) => {
                  const sizeIndex = uniqueDiscSizes.indexOf(disc);
                  const ratio = uniqueDiscSizes.length <= 1 ? 0 : sizeIndex / (uniqueDiscSizes.length - 1);
                  const hue = ratio * 270;
                  const width = 30 + (disc / maxDisc) * 68;
                  return (
                    <div
                      key={`${rodId}-${disc}-${index}`}
                      className="mx-auto flex items-center justify-center rounded-full px-2 text-[10px] font-black text-white shadow-sm sm:text-xs"
                      style={{
                        width: `${width}%`,
                        height: `${discHeight}px`,
                        background: `linear-gradient(135deg, hsl(${hue}, 92%, 64%), hsl(${(hue + 24) % 360}, 88%, 56%))`,
                      }}
                    >
                      {disc}
                    </div>
                  );
                })}
              </div>
              <div className="relative z-10 mt-3 h-4 rounded-full bg-slate-300" />
            </div>
          </button>
        ))}
      </div>

      <CompletionModal
        open={showCompletion}
        durationMs={elapsedMs}
        moves={moves}
        title={mode === "tournament" ? "Рівень турніру завершено!" : "Рівень завершено!"}
        isPending={isSaving}
        onClose={() => {
          (window as typeof window & { __hanoiPauseTournamentRefresh?: boolean }).__hanoiPauseTournamentRefresh = false;
          setShowCompletion(false);
          if (mode === "tournament" && shouldRefreshOnClose) {
            router.refresh();
          }
        }}
      />
    </div>
  );
}
