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
  const [isFlipped, setIsFlipped] = useState(false);

  const copyWaypoints = async () => {
    try {
      await navigator.clipboard.writeText(rare.tomtom_waypoints);
    } catch {
      console.error("Clipboard not available");
    }
  };

  return (
    <article className={`panel rare-card flashcard ${rare.completed ? "rare-completed" : ""} ${isFlipped ? "is-flipped" : ""}`}>
      <div className="flashcard-face flashcard-front">
        <header className="rare-header">
          <div>
            <h3>{rare.name}</h3>
            <p>NPC ID: {rare.npc_id}</p>
          </div>
          <div className="rare-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setIsFlipped(true)}>
              Retourner
            </button>
            <Link href={`/rare/${rare.npc_id}`} className="btn btn-secondary">
              Detail
            </Link>
          </div>
        </header>

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
        </div>
      </div>

      <div className="flashcard-face flashcard-back">
        <header className="rare-header">
          <div>
            <h3>Flashcard {rare.name}</h3>
            <p>Infos de camp et notes</p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={() => setIsFlipped(false)}>
            Recto
          </button>
        </header>

        <div className="rare-actions">
          <a href={rare.wowhead_url} target="_blank" rel="noreferrer" className="btn btn-secondary">
            Ouvrir Wowhead
          </a>
          <button type="button" className="btn btn-secondary" onClick={copyWaypoints}>
            Copier waypoints
          </button>
        </div>

        <div className="notes-row">
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Notes de camp / rotation"
            rows={3}
          />
          <button type="button" className="btn" onClick={() => onSaveNotes(rare, notes)}>
            Sauver note
          </button>
        </div>
      </div>
    </article>
  );
}
