import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireRole } from "@/lib/auth";
import { getTournamentStatusLabel } from "@/lib/labels";
import { listTournamentsForUser } from "@/services/tournament-service";

export default async function AdminTournamentsPage() {
  const admin = await requireRole("admin");
  const tournaments = await listTournamentsForUser(admin.id, admin.role);

  return (
    <main className="page-shell space-y-8 py-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-black text-slate-900">Мої турніри</h1>
          <p className="mt-2 text-slate-600">Створюйте та контролюйте турніри з рівнями з JSON. Після створення вони одразу доступні за кодом.</p>
        </div>
        <Link href="/admin/tournaments/create" className="rounded-full bg-brand-500 px-5 py-3 text-sm font-black text-white transition hover:bg-brand-600">
          Створити новий
        </Link>
      </section>

      {tournaments.length ? (
        <section className="grid gap-4 lg:grid-cols-2">
          {tournaments.map((tournament) => (
            <Card key={tournament.id}>
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-ocean-50 text-ocean-700">{getTournamentStatusLabel(tournament.status)}</Badge>
                <Badge>Код: {tournament.code}</Badge>
              </div>
              <h2 className="mt-4 font-display text-2xl font-black text-slate-900">{tournament.name}</h2>
              <p className="mt-3 text-sm text-slate-600">Рівнів: {tournament.levels.length}</p>
              <p className="mt-1 text-sm text-slate-600">Учасників: {tournament.participants.length}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={`/tournaments/${tournament.id}`} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700">
                  Відкрити
                </Link>
              </div>
            </Card>
          ))}
        </section>
      ) : (
        <EmptyState title="Турніри ще не створені" description="Почніть із першого турніру та виберіть для нього набір JSON-рівнів." ctaHref="/admin/tournaments/create" ctaLabel="Створити турнір" />
      )}
    </main>
  );
}
