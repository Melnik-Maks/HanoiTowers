import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getLevelsCatalog, getRandomLevel } from "@/services/levels-service";

export default async function LevelsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireUser();
  const params = await searchParams;
  const levels = await getLevelsCatalog(params.q);
  const randomLevel = await getRandomLevel();

  return (
    <main className="page-shell space-y-8 py-8">
      <section className="panel p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-700">Рівні</p>
            <h1 className="mt-3 font-display text-4xl font-black text-slate-900">Оберіть режим гри</h1>
            <p className="mt-3 max-w-3xl text-slate-600">Є класичні рівні з 3–8 дисками та рівні з `variants.json`. Некоректні рівні автоматично блокуються.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {randomLevel ? (
              <Link href={`/levels/${randomLevel.id}`} className="rounded-full bg-ocean-500 px-5 py-3 text-sm font-black text-white transition hover:bg-ocean-600">
                Випадковий рівень
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[3, 4, 5, 6, 7, 8].map((disks) => (
          <Link key={disks} href={`/levels/classic-${disks}`} className="panel p-6 transition hover:-translate-y-1 hover:border-brand-200 hover:bg-brand-50">
            <Badge className="bg-brand-50 text-brand-700">Класичний режим</Badge>
            <h2 className="mt-4 font-display text-2xl font-black text-slate-900">{disks} дисків</h2>
            <p className="mt-2 text-slate-600">Усі диски стартують на першому стрижні. Мета — перенести башту на третій.</p>
          </Link>
        ))}
      </section>

      <section className="panel p-6 sm:p-8">
        <form className="mb-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            name="q"
            defaultValue={params.q || ""}
            placeholder="Фільтр за номером рівня"
            className="min-h-12 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 shadow-sm transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
          <button type="submit" className="rounded-full bg-brand-500 px-5 py-3 text-sm font-black text-white transition hover:bg-brand-600">
            Знайти
          </button>
        </form>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {levels.map((level) => (
            <Card key={level.id} className={level.valid ? "" : "border-rose-200 bg-rose-50"}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">JSON-рівень</p>
                  <h3 className="mt-2 text-2xl font-black text-slate-900">#{level.id}</h3>
                </div>
                <Badge className={level.valid ? "bg-emerald-50 text-emerald-700" : "bg-rose-100 text-rose-700"}>
                  {level.valid ? "Валідний" : "Помилка"}
                </Badge>
              </div>
              <p className="mt-4 text-sm text-slate-600">Дисків: {level.discCount}</p>
              {level.valid ? (
                <Link href={`/levels/${level.id}`} className="mt-5 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700">
                  Відкрити рівень
                </Link>
              ) : (
                <p className="mt-4 text-sm text-rose-700">Рівень заблоковано: {level.errors[0]}</p>
              )}
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
