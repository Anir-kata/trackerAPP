import type { Zone } from "@/lib/types";
import { formatDate } from "@/lib/time";
import { StatusBadge } from "./StatusBadge";

export function TimerPanel({ zone }: { zone: Zone }) {
  return (
    <section className="panel timers">
      <h2 className="panel-title">Fenetre de repop</h2>
      <div className="timer-grid">
        <p>
          Dernier vu
          <strong>{formatDate(zone.last_seen_at)}</strong>
        </p>
        <p>
          Earliest spawn
          <strong>{formatDate(zone.earliest_spawn)}</strong>
        </p>
        <p>
          Latest spawn
          <strong>{formatDate(zone.latest_spawn)}</strong>
        </p>
        <p>
          Dernier rare vu
          <strong>{zone.latest_rare_seen?.name || "-"}</strong>
        </p>
      </div>
      <StatusBadge status={zone.status} />
    </section>
  );
}
