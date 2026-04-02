import { CreateTournamentForm } from "@/components/tournaments/create-tournament-form";
import { requireRole } from "@/lib/auth";
import { getLevelsCatalog } from "@/services/levels-service";

export default async function CreateTournamentPage() {
  await requireRole("admin");
  const levels = (await getLevelsCatalog()).filter((level) => level.valid);

  return (
    <main className="page-shell py-8">
      <CreateTournamentForm levels={levels} />
    </main>
  );
}
