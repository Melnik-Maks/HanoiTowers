import { notFound } from "next/navigation";

import { HanoiGame } from "@/components/game/hanoi-game";
import { Alert } from "@/components/ui/alert";
import { requireUser } from "@/lib/auth";
import { createClassicLevel, getLevelById } from "@/services/levels-service";

export default async function LevelDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  try {
    if (id.startsWith("classic-")) {
      const disks = Number(id.replace("classic-", ""));
      const level = createClassicLevel(disks);

      return (
        <main className="page-shell py-8">
          <HanoiGame
            level={level}
            mode="standard"
            classicDisks={disks}
            heading={`Класичний рівень: ${disks} дисків`}
            description="Усі диски стартують на першому стрижні. Потрібно перенести всю вежу на третій стрижень, не кладучи більший диск на менший."
          />
        </main>
      );
    }

    const levelId = Number(id);
    if (Number.isNaN(levelId)) {
      notFound();
    }

    const level = await getLevelById(levelId);
    if (!level) {
      notFound();
    }

    return (
      <main className="page-shell py-8">
        <HanoiGame
          level={level}
          mode="standard"
          heading={`JSON-рівень #${levelId}`}
          description="Стан гри побудовано напряму з полів st1, st2, st3 після серверної валідації JSON-рівня."
        />
      </main>
    );
  } catch (error) {
    return (
      <main className="page-shell py-8">
        <Alert variant="error" message={error instanceof Error ? error.message : "Не вдалося відкрити рівень."} />
      </main>
    );
  }
}
