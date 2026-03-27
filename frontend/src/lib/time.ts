import type { ZoneStatus } from "./types";

export function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function statusLabel(status: ZoneStatus) {
  if (status === "too_early") return "Trop tot";
  if (status === "check_now") return "Verifier";
  return "En retard";
}
