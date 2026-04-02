import Link from "next/link";

import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="page-shell py-10">
      <Card className="text-center">
        <h1 className="font-display text-4xl font-black text-slate-900">Сторінку не знайдено</h1>
        <p className="mt-3 text-slate-600">Можливо, рівень або турнір було видалено чи адреса введена з помилкою.</p>
        <div className="mt-6">
          <Link href="/dashboard" className="rounded-full bg-brand-500 px-5 py-3 text-sm font-black text-white transition hover:bg-brand-600">
            До кабінету
          </Link>
        </div>
      </Card>
    </main>
  );
}
