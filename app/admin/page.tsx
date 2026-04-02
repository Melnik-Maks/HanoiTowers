import Link from "next/link";

import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  await requireRole("admin");

  const [usersCount, tournamentsCount, activeCount] = await Promise.all([
    prisma.user.count({ where: { role: "child" } }),
    prisma.tournament.count(),
    prisma.tournament.count({ where: { status: "active" } }),
  ]);

  return (
    <main className="page-shell space-y-8 py-8">
      <section className="panel p-6 sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-ocean-700">Адміністрування</p>
        <h1 className="mt-3 font-display text-4xl font-black text-slate-900">Панель адміністратора</h1>
        <p className="mt-3 max-w-3xl text-slate-600">Створюйте турніри, запускайте їх і стежте за участю дітей у реальному часі.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/admin/tournaments" className="rounded-full bg-brand-500 px-5 py-3 text-sm font-black text-white transition hover:bg-brand-600">Список турнірів</Link>
          <Link href="/admin/tournaments/create" className="rounded-full bg-ocean-500 px-5 py-3 text-sm font-black text-white transition hover:bg-ocean-600">Новий турнір</Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Дітей</p>
          <p className="mt-3 text-4xl font-black text-slate-900">{usersCount}</p>
        </Card>
        <Card>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Усього турнірів</p>
          <p className="mt-3 text-4xl font-black text-slate-900">{tournamentsCount}</p>
        </Card>
        <Card>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Активних зараз</p>
          <p className="mt-3 text-4xl font-black text-slate-900">{activeCount}</p>
        </Card>
      </section>
    </main>
  );
}
