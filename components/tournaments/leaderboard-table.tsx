import { formatDate, formatDuration } from "@/lib/utils";
import { getParticipantStatusLabel } from "@/lib/labels";
import type { LeaderboardEntry } from "@/types";

type LeaderboardTableProps = {
  entries: LeaderboardEntry[];
};

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  return (
    <div className="panel overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-slate-600">Місце</th>
              <th className="px-4 py-3 text-left font-bold text-slate-600">Ім'я</th>
              <th className="px-4 py-3 text-left font-bold text-slate-600">Рівні</th>
              <th className="px-4 py-3 text-left font-bold text-slate-600">Час</th>
              <th className="px-4 py-3 text-left font-bold text-slate-600">Ходи</th>
              <th className="px-4 py-3 text-left font-bold text-slate-600">Статус</th>
              <th className="px-4 py-3 text-left font-bold text-slate-600">Завершення</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {entries.map((entry) => (
              <tr key={entry.userId}>
                <td className="px-4 py-3 font-black text-brand-700">#{entry.rank}</td>
                <td className="px-4 py-3 font-semibold text-slate-900">{entry.name}</td>
                <td className="px-4 py-3 text-slate-600">{entry.completedLevels}</td>
                <td className="px-4 py-3 text-slate-600">{formatDuration(entry.totalDurationMs)}</td>
                <td className="px-4 py-3 text-slate-600">{entry.totalMoves}</td>
                <td className="px-4 py-3 text-slate-600">{getParticipantStatusLabel(entry.status)}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(entry.finishedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
