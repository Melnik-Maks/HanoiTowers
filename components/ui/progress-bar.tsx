import { cn } from "@/lib/utils";

type ProgressBarProps = {
  value: number;
  total: number;
  className?: string;
};

export function ProgressBar({ value, total, className }: ProgressBarProps) {
  const percent = total === 0 ? 0 : Math.min(100, Math.round((value / total) * 100));

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
        <span>Прогрес</span>
        <span>{value}/{total}</span>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-400 to-ocean-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
