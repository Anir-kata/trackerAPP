"use client";

import Link from "next/link";
import type { Rare } from "@/lib/types";

type Props = {
  rare: Rare;
  onToggleCompleted: (rare: Rare, completed: boolean) => Promise<void>;
  onSeenNow: (rare: Rare) => Promise<void>;
};

export function RareCard({ rare, onToggleCompleted, onSeenNow }: Props) {

  const copyWaypoints = async () => {
    try {
      await navigator.clipboard.writeText(rare.tomtom_waypoints);
    } catch {
      console.error("Clipboard not available");
    }
  };

  return (
    <article
      className={`panel rare-card flashcard compact-card ${rare.completed ? "rare-completed" : ""}`}
      role="button"
      tabIndex={0}
      onClick={() => onSeenNow(rare)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSeenNow(rare);
        }
      }}
      title="Cliquer pour marquer Vu maintenant"
    >
      <div className="compact-head">
        <h3>{rare.name}</h3>
        <span className={`completion-pill ${rare.completed ? "is-done" : "is-pending"}`}>
          {rare.completed ? "Complete" : "A faire"}
        </span>
      </div>

      <div className="compact-actions" onClick={(event) => event.stopPropagation()}>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={rare.completed}
            onChange={(event) => onToggleCompleted(rare, event.target.checked)}
          />
          Complete
        </label>

        <div className="rare-actions">
          <Link href={`/rare/${rare.npc_id}`} className="btn btn-secondary">
            Detail
          </Link>
          <a href={rare.wowhead_url} target="_blank" rel="noreferrer" className="btn btn-secondary">
            Wowhead
          </a>
          <button type="button" className="btn btn-secondary" onClick={copyWaypoints}>
            Waypoints
          </button>
        </div>
      </div>
    </article>
  );
}
