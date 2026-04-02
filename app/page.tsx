import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="page-shell space-y-10 py-10">
      <section className="panel overflow-hidden p-8 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-700">Ігрова платформа</p>
            <h1 className="mt-4 font-display text-5xl font-black leading-none text-slate-900 sm:text-6xl">
              Ханойські вежі для дітей, рівнів і турнірів
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-600">
              Грайте у класичні вежі, відкривайте рівні з JSON, стежте за прогресом і змагайтеся в турнірах у реальному часі.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href={user ? "/dashboard" : "/register"} className="rounded-full bg-brand-500 px-6 py-3 text-sm font-black text-white transition hover:bg-brand-600">
                {user ? "Перейти в кабінет" : "Почати гру"}
              </Link>
              <Link href="/levels" className="rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-800 ring-1 ring-slate-200 transition hover:ring-brand-300">
                Переглянути рівні
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] bg-gradient-to-br from-brand-100 via-white to-ocean-100 p-6">
            <div className="space-y-4">
              <div className="rounded-[1.75rem] bg-white p-5 shadow-card">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">Що всередині</p>
                <ul className="mt-4 space-y-3 text-slate-700">
                  <li>Класичні рівні від 3 до 8 дисків</li>
                  <li>1000 JSON-рівнів із валідацією</li>
                  <li>Турніри з кодом доступу</li>
                  <li>Leaderboard та збереження результатів</li>
                </ul>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-[1.5rem] bg-brand-500 px-3 py-5 text-white">
                  <p className="text-3xl font-black">3</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em]">Стрижні</p>
                </div>
                <div className="rounded-[1.5rem] bg-ocean-500 px-3 py-5 text-white">
                  <p className="text-3xl font-black">2</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em]">Ролі</p>
                </div>
                <div className="rounded-[1.5rem] bg-rose-500 px-3 py-5 text-white">
                  <p className="text-3xl font-black">∞</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em]">Спроб</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
