"use client";

import Link from "next/link";
import { useState } from "react";
import type { Rare } from "@/lib/types";

type Props = {
  rare: Rare;
  onToggleCompleted: (rare: Rare, completed: boolean) => Promise<void>;
  onSeenNow: (rare: Rare) => Promise<void>;
  onSaveNotes: (rare: Rare, notes: string) => Promise<void>;
};

export function RareCard({ rare, onToggleCompleted, onSeenNow, onSaveNotes }: Props) {
  const [notes, setNotes] = useState(rare.notes || "");

  const copyWaypoints = async () => {
    try {
      await navigator.clipboard.writeText(rare.tomtom_waypoints);
    } catch {
      console.error("Clipboard not available");
    }
  };

  return (
    <article className={`panel rare-card ${rare.completed ? "rare-completed" : ""}`}>
      <header className="rare-header">
        <div>
          <h3>{rare.name}</h3>
          <p>NPC ID: {rare.npc_id}</p>
        </div>
        <div className="rare-actions">
          <a href={rare.wowhead_url} target="_blank" rel="noreferrer" className="btn btn-secondary">
            Ouvrir Wowhead
          </a>
          <Link href={`/rare/${rare.npc_id}`} className="btn btn-secondary">
            Detail
          </Link>
        </div>
      </header>

      {rare.map_image_url ? (
        <div className="map-wrapper">
          <img src={rare.map_image_url} alt={`Carte de ${rare.name}`} className="map-image" />
          {rare.spawn_points.map((point, index) => (
            <span
              key={`${rare.id}-${index}`}
              className="spawn-dot"
              style={{ left: `${point[0]}%`, top: `${point[1]}%` }}
              title={`Spawn ${point[0]}, ${point[1]}`}
            />
          ))}
        </div>
      ) : null}

      <div className="spawn-list">
        {rare.spawn_points.map((point, index) => (
          <code key={`${rare.id}-coord-${index}`}>
            {point[0]}, {point[1]}
          </code>
        ))}
      </div>

      <div className="rare-footer">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={rare.completed}
            onChange={(event) => onToggleCompleted(rare, event.target.checked)}
          />
          Complete
        </label>
        <button type="button" className="btn" onClick={() => onSeenNow(rare)}>
          Vu maintenant
        </button>
        <button type="button" className="btn btn-secondary" onClick={copyWaypoints}>
          Copier waypoints
        </button>
      </div>

      <div className="notes-row">
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Notes de camp / rotation"
          rows={2}
        />
        <button type="button" className="btn btn-secondary" onClick={() => onSaveNotes(rare, notes)}>
          Sauver note
        </button>
      </div>
    </article>
  );
}
