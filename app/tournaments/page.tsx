import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth";
import { getTournamentStatusLabel } from "@/lib/labels";
import { listTournamentsForUser } from "@/services/tournament-service";

export default async function TournamentsPage() {
  const user = await requireUser();
  const tournaments = await listTournamentsForUser(user.id, user.role);

  return (
    <main className="page-shell space-y-8 py-8">
      <section className="panel p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-ocean-700">Турніри</p>
            <h1 className="mt-3 font-display text-4xl font-black text-slate-900">Змагання та leaderboard</h1>
            <p className="mt-3 max-w-3xl text-slate-600">
              Адміністратор створює турніри з рівнів `variants.json`, а тут відображаються лише ті турніри, до яких ви вже приєдналися.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {user.role === "child" ? (
              <Link href="/tournaments/join" className="rounded-full bg-brand-500 px-5 py-3 text-sm font-black text-white transition hover:bg-brand-600">Приєднатися за кодом</Link>
            ) : (
              <Link href="/admin/tournaments/create" className="rounded-full bg-ocean-500 px-5 py-3 text-sm font-black text-white transition hover:bg-ocean-600">Створити турнір</Link>
            )}
          </div>
        </div>
      </section>

      {tournaments.length ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tournaments.map((tournament) => (
            <Link key={tournament.id} href={`/tournaments/${tournament.id}`} className="panel p-6 transition hover:-translate-y-1 hover:border-brand-200 hover:bg-brand-50">
              <div className="flex items-center justify-between gap-3">
                <Badge className="bg-ocean-50 text-ocean-700">{getTournamentStatusLabel(tournament.status)}</Badge>
                <Badge>Код: {tournament.code}</Badge>
              </div>
              <h2 className="mt-4 font-display text-2xl font-black text-slate-900">{tournament.name}</h2>
              <p className="mt-3 text-sm text-slate-600">Рівнів: {tournament.levels.length}</p>
              <p className="mt-1 text-sm text-slate-600">Учасників: {tournament.participants.length}</p>
            </Link>
          ))}
        </section>
      ) : (
        <EmptyState
          title="Турнірів поки немає"
          description={user.role === "admin" ? "Створіть перший турнір і запросіть учасників за кодом." : "Попросіть адміністратора створити турнір або введіть код приєднання."}
          ctaHref={user.role === "admin" ? "/admin/tournaments/create" : "/tournaments/join"}
          ctaLabel={user.role === "admin" ? "Створити турнір" : "Ввести код"}
        />
      )}
    </main>
  );
}
