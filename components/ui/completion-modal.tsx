"use client";

import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";

type CompletionModalProps = {
  open: boolean;
  durationMs: number;
  moves: number;
  title?: string;
  isPending?: boolean;
  onClose: () => void;
};

export function CompletionModal({
  open,
  durationMs,
  moves,
  title = "Рівень завершено!",
  isPending = false,
  onClose,
}: CompletionModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="panel max-w-md p-6 text-center">
        <h3 className="font-display text-3xl font-black text-slate-900">{title}</h3>
        <p className="mt-3 text-slate-600">
          {isPending ? "Чудова робота! Зберігаємо результат..." : "Чудова робота! Результат уже збережено."}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4 text-left">
          <div className="rounded-2xl bg-brand-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Час</p>
            <p className="mt-2 text-2xl font-black text-brand-900">{formatDuration(durationMs)}</p>
          </div>
          <div className="rounded-2xl bg-ocean-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ocean-700">Ходи</p>
            <p className="mt-2 text-2xl font-black text-ocean-900">{moves}</p>
          </div>
        </div>
        <div className="mt-6">
          <Button type="button" onClick={onClose} className="w-full" disabled={isPending}>
            {isPending ? "Збереження..." : "Продовжити"}
          </Button>
        </div>
      </div>
    </div>
  );
}
