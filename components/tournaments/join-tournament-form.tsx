"use client";

import { useActionState } from "react";

import { joinTournamentAction } from "@/app/actions/tournament";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialFormState } from "@/types";

export function JoinTournamentForm() {
  const [state, formAction] = useActionState(joinTournamentAction, initialFormState);

  return (
    <form action={formAction} className="panel space-y-5 p-6 sm:p-8">
      <div>
        <h1 className="font-display text-3xl font-black text-slate-900">Приєднатися до турніру</h1>
        <p className="mt-2 text-slate-600">Введіть короткий код, який дав адміністратор.</p>
      </div>

      {state.message ? <Alert variant="error" message={state.message} /> : null}

      <Input label="Код турніру" name="code" placeholder="Наприклад, A8Q2KM" required error={state.fieldErrors?.code?.[0]} />
      <SubmitButton label="Приєднатися" pendingLabel="Підключаємо..." className="w-full" />
    </form>
  );
}
