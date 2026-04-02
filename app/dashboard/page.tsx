import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth";
import { getRoleLabel, getTournamentStatusLabel } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { formatDate, formatDuration } from "@/lib/utils";
import { listTournamentsForUser } from "@/services/tournament-service";

export default async function DashboardPage() {
  const user = await requireUser();
  const [resultsCount, recentResults, tournaments] = await Promise.all([
    prisma.gameResult.count({ where: { userId: user.id } }),
    prisma.gameResult.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: "desc" },
      take: 5,
    }),
    listTournamentsForUser(user.id, user.role),
  ]);

  return (
    <main className="page-shell space-y-8 py-8">
      <section className="panel p-6 sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-700">Кабінет</p>
        <h1 className="mt-3 font-display text-4xl font-black text-slate-900">Вітаємо, {user.name}!</h1>
        <p className="mt-3 max-w-3xl text-slate-600">Тут видно ваші останні результати, турніри й швидкі переходи до гри.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/levels" className="rounded-full bg-brand-500 px-5 py-3 text-sm font-black text-white transition hover:bg-brand-600">До рівнів</Link>
          <Link href="/tournaments" className="rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-800 ring-1 ring-slate-200 transition hover:ring-ocean-300">До турнірів</Link>
          {user.role === "admin" ? (
            <Link href="/admin" className="rounded-full bg-ocean-500 px-5 py-3 text-sm font-black text-white transition hover:bg-ocean-600">Панель адміністратора</Link>
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Роль</p>
          <p className="mt-3 text-3xl font-black text-slate-900">{getRoleLabel(user.role)}</p>
        </Card>
        <Card>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Результатів</p>
          <p className="mt-3 text-3xl font-black text-slate-900">{resultsCount}</p>
        </Card>
        <Card>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Турнірів</p>
          <p className="mt-3 text-3xl font-black text-slate-900">{tournaments.length}</p>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-black text-slate-900">Останні результати</h2>
            <Link href="/profile" className="text-sm font-bold text-brand-700 hover:text-brand-800">Профіль</Link>
          </div>
          <div className="mt-4 space-y-4">
            {recentResults.length ? (
              recentResults.map((result) => (
                <div key={result.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge>{result.source === "classic" ? `Класика: ${result.classicDisks} дисків` : `JSON #${result.jsonLevelId}`}</Badge>
                    <Badge className="bg-ocean-50 text-ocean-700">{formatDuration(result.durationMs)}</Badge>
                    <Badge className="bg-brand-50 text-brand-700">Ходи: {result.moves}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">{formatDate(result.completedAt)}</p>
                </div>
              ))
            ) : (
              <EmptyState title="Ще немає результатів" description="Почніть із будь-якого рівня, і ваші результати з'являться тут." ctaHref="/levels" ctaLabel="Перейти до рівнів" />
            )}
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-2xl font-black text-slate-900">Мої турніри</h2>
          <div className="mt-4 space-y-4">
            {tournaments.length ? (
              tournaments.slice(0, 5).map((tournament) => (
                <Link key={tournament.id} href={`/tournaments/${tournament.id}`} className="block rounded-2xl border border-slate-200 p-4 transition hover:border-brand-300 hover:bg-brand-50">
                  <p className="text-lg font-black text-slate-900">{tournament.name}</p>
                  <p className="mt-2 text-sm text-slate-600">Код: {tournament.code}</p>
                  <p className="mt-1 text-sm text-slate-500">Статус: {getTournamentStatusLabel(tournament.status)}</p>
                </Link>
              ))
            ) : (
              <EmptyState title="Турнірів поки немає" description="Приєднайтеся до турніру за кодом або дочекайтеся нового старту." ctaHref="/tournaments" ctaLabel="Перейти до турнірів" />
            )}
          </div>
        </Card>
      </section>
    </main>
  );
}
