import { JoinTournamentForm } from "@/components/tournaments/join-tournament-form";
import { requireRole } from "@/lib/auth";

export default async function JoinTournamentPage() {
  await requireRole("child");

  return (
    <main className="page-shell py-10">
      <div className="mx-auto max-w-2xl">
        <JoinTournamentForm />
      </div>
    </main>
  );
}
