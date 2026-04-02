"use client";

import { useTransition } from "react";

import { logoutAction } from "@/app/actions/auth";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => logoutAction())}
      className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
      disabled={isPending}
    >
      {isPending ? "Вихід..." : "Вийти"}
    </button>
  );
}
