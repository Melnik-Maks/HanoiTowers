export function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    admin: "Адміністратор",
    child: "Дитина",
  };

  return labels[role] || role;
}

export function getTournamentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    draft: "Чернетка",
    active: "Активний",
    finished: "Завершений",
  };

  return labels[status] || status;
}

export function getParticipantStatusLabel(status: string) {
  const labels: Record<string, string> = {
    joined: "Очікує старту",
    in_progress: "У процесі",
    finished: "Завершено",
  };

  return labels[status] || status;
}
