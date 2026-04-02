"use client";

import { useActionState } from "react";

import { registerAction } from "@/app/actions/auth";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialFormState } from "@/types";

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initialFormState);

  return (
    <form action={formAction} className="panel space-y-5 p-6 sm:p-8">
      <div>
        <h1 className="font-display text-3xl font-black text-slate-900">Реєстрація</h1>
        <p className="mt-2 text-slate-600">Створіть дитячий профіль, щоб проходити рівні й брати участь у турнірах.</p>
      </div>

      {state.message ? <Alert variant="error" message={state.message} /> : null}

      <Input label="Ім'я" name="name" placeholder="Ваше ім'я" required error={state.fieldErrors?.name?.[0]} />
      <Input label="Email" name="email" type="email" placeholder="you@example.com" required error={state.fieldErrors?.email?.[0]} />
      <Input
        label="Пароль"
        name="password"
        type="password"
        placeholder="Щонайменше 8 символів"
        required
        error={state.fieldErrors?.password?.[0]}
      />
      <Input
        label="Підтвердження пароля"
        name="confirmPassword"
        type="password"
        placeholder="Повторіть пароль"
        required
        error={state.fieldErrors?.confirmPassword?.[0]}
      />

      <SubmitButton label="Створити акаунт" pendingLabel="Створюємо..." className="w-full" />
    </form>
  );
}
