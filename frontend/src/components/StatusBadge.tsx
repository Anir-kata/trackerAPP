import type { ZoneStatus } from "@/lib/types";
import { statusLabel } from "@/lib/time";

const statusClass: Record<ZoneStatus, string> = {
  too_early: "status-badge status-red",
  check_now: "status-badge status-yellow",
  overdue: "status-badge status-green",
};

export function StatusBadge({ status }: { status: ZoneStatus }) {
  return <span className={statusClass[status]}>{statusLabel(status)}</span>;
}
