import Link from "next/link";

import { SignOutButton } from "@/components/layout/sign-out-button";
import { getCurrentUser } from "@/lib/auth";
import { getRoleLabel } from "@/lib/labels";

const navItems = [
  { href: "/dashboard", label: "Кабінет" },
  { href: "/levels", label: "Рівні" },
  { href: "/tournaments", label: "Турніри" },
  { href: "/profile", label: "Профіль" },
];

export async function AppHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-20 border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <div className="page-shell flex items-center justify-between gap-4 py-4">
        <Link href="/" className="font-display text-2xl font-black text-brand-700">
          Ханойські вежі
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {user &&
            navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-semibold text-slate-700 hover:text-brand-700"
              >
                {item.label}
              </Link>
            ))}
          {user?.role === "admin" ? (
            <Link href="/admin" className="text-sm font-semibold text-ocean-700 hover:text-ocean-900">
              Адмін
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold text-slate-900">{user.name}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{getRoleLabel(user.role)}</p>
              </div>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-brand-400 hover:text-brand-700"
              >
                Увійти
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600"
              >
                Реєстрація
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
