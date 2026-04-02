import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth";
import { getParticipantStatusLabel, getRoleLabel } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { formatDate, formatDuration } from "@/lib/utils";

export default async function ProfilePage() {
  const user = await requireUser();
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      gameResults: {
        orderBy: { completedAt: "desc" },
      },
      participants: {
        include: {
          tournament: true,
        },
        orderBy: { joinedAt: "desc" },
      },
    },
  });

  return (
    <main className="page-shell space-y-8 py-8">
      <section className="panel p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-700">Профіль</p>
            <h1 className="mt-3 font-display text-4xl font-black text-slate-900">{user.name}</h1>
            <p className="mt-2 text-slate-600">{user.email}</p>
          </div>
          <Badge className="bg-ocean-50 text-ocean-700">Роль: {getRoleLabel(user.role)}</Badge>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <h2 className="font-display text-2xl font-black text-slate-900">Історія ігор</h2>
          <div className="mt-4 space-y-4">
            {dbUser?.gameResults.length ? (
              dbUser.gameResults.map((result) => (
                <div key={result.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap gap-3">
                    <Badge>{result.source === "classic" ? `Класика: ${result.classicDisks} дисків` : `JSON #${result.jsonLevelId}`}</Badge>
                    <Badge className="bg-brand-50 text-brand-700">{formatDuration(result.durationMs)}</Badge>
                    <Badge className="bg-ocean-50 text-ocean-700">Ходи: {result.moves}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">{formatDate(result.completedAt)}</p>
                </div>
              ))
            ) : (
              <EmptyState title="Ігор ще не було" description="Пройдіть перший рівень, щоб побачити історію результатів." ctaHref="/levels" ctaLabel="Почати гру" />
            )}
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-2xl font-black text-slate-900">Участь у турнірах</h2>
          <div className="mt-4 space-y-4">
            {dbUser?.participants.length ? (
              dbUser.participants.map((participant) => (
                <Link key={participant.id} href={`/tournaments/${participant.tournamentId}`} className="block rounded-2xl border border-slate-200 p-4 transition hover:border-ocean-300 hover:bg-ocean-50">
                  <p className="font-black text-slate-900">{participant.tournament.name}</p>
                  <p className="mt-2 text-sm text-slate-600">Статус: {getParticipantStatusLabel(participant.status)}</p>
                  <p className="mt-1 text-sm text-slate-600">Рівнів завершено: {participant.completedLevels}</p>
                </Link>
              ))
            ) : (
              <EmptyState title="Турнірів ще немає" description="Приєднайтеся до турніру за кодом і ваш прогрес з'явиться тут." ctaHref="/tournaments/join" ctaLabel="Ввести код" />
            )}
          </div>
        </Card>
      </section>
    </main>
  );
}
