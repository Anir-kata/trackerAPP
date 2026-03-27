"use client";

import { useState } from "react";
import type { Rare } from "@/lib/types";

type Props = {
  rare: Rare;
  onRequestAction: (rare: Rare) => void;
};

export function RareCard({ rare, onRequestAction }: Props) {
  const [pressed, setPressed] = useState(false);

  return (
    <article
      className={`panel rare-card flashcard compact-card ${rare.completed ? "is-done" : "is-pending"}`}
      role="button"
      tabIndex={0}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onClick={() => onRequestAction(rare)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onRequestAction(rare);
        }
      }}
      title="Cliquer pour choisir Seen ou Complete"
      aria-pressed={pressed}
    >
      <div className="compact-head">
        <h3>{rare.name}</h3>
        <span className={`completion-pill ${rare.completed ? "is-done" : "is-pending"}`}>
          {rare.completed ? "Complete" : "A faire"}
        </span>
      </div>

      <div className="compact-subline">Clique pour valider une action</div>
    </article>
  );
}
