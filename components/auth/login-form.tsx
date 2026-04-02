"use client";

import { useActionState } from "react";

import { loginAction } from "@/app/actions/auth";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialFormState } from "@/types";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(loginAction, initialFormState);

  return (
    <form action={formAction} className="panel space-y-5 p-6 sm:p-8">
      <div>
        <h1 className="font-display text-3xl font-black text-slate-900">Вхід</h1>
        <p className="mt-2 text-slate-600">Увійдіть, щоб грати, зберігати результати і брати участь у турнірах.</p>
      </div>

      <input type="hidden" name="next" value={next || ""} />

      {state.message ? <Alert variant="error" message={state.message} /> : null}

      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
        required
        error={state.fieldErrors?.email?.[0]}
      />
      <Input
        label="Пароль"
        name="password"
        type="password"
        placeholder="Введіть пароль"
        required
        error={state.fieldErrors?.password?.[0]}
      />

      <SubmitButton label="Увійти" pendingLabel="Входимо..." className="w-full" />
    </form>
  );
}
