import Link from "next/link";

import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <main className="page-shell grid gap-8 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
      <div className="space-y-5">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-700">Новий гравець</p>
        <h1 className="font-display text-5xl font-black text-slate-900">Створіть профіль дитини</h1>
        <p className="max-w-xl text-lg text-slate-600">Після реєстрації можна грати у класичні рівні, проходити JSON-завдання та приєднуватися до турнірів.</p>
        <p className="text-slate-600">
          Уже є акаунт? <Link href="/login" className="font-bold text-ocean-700 hover:text-ocean-800">Увійти</Link>
        </p>
      </div>
      <RegisterForm />
    </main>
  );
}
