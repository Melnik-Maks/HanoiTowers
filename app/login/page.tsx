import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="page-shell grid gap-8 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
      <div className="space-y-5">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-ocean-700">Повернення до гри</p>
        <h1 className="font-display text-5xl font-black text-slate-900">Увійдіть у свій профіль</h1>
        <p className="max-w-xl text-lg text-slate-600">Після входу відкриються рівні, турніри, результати та особистий прогрес.</p>
        <p className="text-slate-600">
          Немає акаунта? <Link href="/register" className="font-bold text-brand-700 hover:text-brand-800">Створити профіль</Link>
        </p>
      </div>
      <LoginForm next={params.next} />
    </main>
  );
}
