"use client";

import { useActionState, useState } from "react";

import { createTournamentAction } from "@/app/actions/tournament";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialFormState } from "@/types";

type CreateTournamentFormProps = {
  levels: Array<{ id: number; discCount: number; valid: boolean }>;
};

export function CreateTournamentForm({ levels }: CreateTournamentFormProps) {
  const [state, formAction] = useActionState(createTournamentAction, initialFormState);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  const filteredLevels = levels.filter((level) => level.id.toString().includes(query));

  const toggleLevel = (levelId: number) => {
    setSelected((current) =>
      current.includes(levelId) ? current.filter((id) => id !== levelId) : [...current, levelId].sort((a, b) => a - b),
    );
  };

  return (
    <form action={formAction} className="space-y-6">
      <div className="panel space-y-5 p-6">
        <div>
          <h1 className="font-display text-3xl font-black text-slate-900">Створення турніру</h1>
          <p className="mt-2 text-slate-600">Оберіть назву та набір рівнів із файлу `variants.json`.</p>
        </div>

        {state.message ? <Alert variant="error" message={state.message} /> : null}

        <Input label="Назва турніру" name="name" placeholder="Наприклад, Весняний кубок" required error={state.fieldErrors?.name?.[0]} />
        <Input label="Пошук рівня" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Номер рівня" />

        <input type="hidden" name="levelIds" value={JSON.stringify(selected)} />

        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-bold text-slate-800">Обрано рівнів: {selected.length}</p>
            {selected.length > 0 ? (
              <Button type="button" variant="ghost" onClick={() => setSelected([])}>
                Очистити
              </Button>
            ) : null}
          </div>
          <div className="grid max-h-[32rem] gap-3 overflow-y-auto md:grid-cols-2 xl:grid-cols-3">
            {filteredLevels.map((level) => {
              const active = selected.includes(level.id);
              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => toggleLevel(level.id)}
                  className={`rounded-2xl border p-4 text-left transition ${active ? "border-brand-400 bg-brand-50" : "border-slate-200 bg-white hover:border-ocean-300"}`}
                >
                  <p className="text-lg font-black text-slate-900">Рівень #{level.id}</p>
                  <p className="mt-2 text-sm text-slate-600">Дисків: {level.discCount}</p>
                  <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{active ? "Обрано" : "Додати"}</p>
                </button>
              );
            })}
          </div>
        </div>

        <SubmitButton label="Зберегти турнір" pendingLabel="Створюємо..." />
      </div>
    </form>
  );
}
