"use client";

import { useState } from "react";
import type { Rare } from "@/lib/types";

type Props = {
  rare: Rare;
  onSeenNow: (rare: Rare) => Promise<void>;
  onComplete: (rare: Rare) => Promise<void>;
};

export function RareCard({ rare, onSeenNow, onComplete }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <article
      className={`panel rare-card flashcard compact-card ${rare.completed ? "rare-completed" : ""}`}
      role="button"
      tabIndex={0}
      onClick={() => setConfirmOpen(true)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setConfirmOpen(true);
        }
      }}
      title="Cliquer pour choisir Seen ou Complete"
    >
      <div className="compact-head">
        <h3>{rare.name}</h3>
        <span className={`completion-pill ${rare.completed ? "is-done" : "is-pending"}`}>
          {rare.completed ? "Complete" : "A faire"}
        </span>
      </div>

      <div className="compact-subline">Clique pour valider une action</div>

      {confirmOpen ? (
        <div className="card-confirm" onClick={(event) => event.stopPropagation()}>
          <p>Choisir une action:</p>
          <div className="confirm-actions">
            <button
              type="button"
              className="btn"
              onClick={async () => {
                await onSeenNow(rare);
                setConfirmOpen(false);
              }}
            >
              Seen
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={async () => {
                await onComplete(rare);
                setConfirmOpen(false);
              }}
            >
              Complete
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setConfirmOpen(false)}>
              Annuler
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
