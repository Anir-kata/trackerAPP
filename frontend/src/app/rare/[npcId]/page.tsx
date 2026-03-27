"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { RareDetailResponse } from "@/lib/types";

export default function RareDetailsPage() {
  const params = useParams<{ npcId: string }>();
  const [rare, setRare] = useState<RareDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const all = await api.getRares();
        const found = all.find((item) => item.npc_id === Number(params.npcId));
        if (!found) {
          setError("Rare introuvable");
          return;
        }
        const details = await api.getRareById(found.id);
        setRare(details);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
      }
    }

    load();
  }, [params]);

  if (error) {
    return <main className="single-page">Erreur: {error}</main>;
  }

  if (!rare) {
    return <main className="single-page">Chargement...</main>;
  }

  return (
    <main className="single-page">
      <article className="panel single-card">
        <h1>{rare.name}</h1>
        <p>NPC ID: {rare.npc_id}</p>
        <p>Zone: {rare.zone.name}</p>
        <p>Carte visuelle retiree: flashcards seulement par zone.</p>
        <div className="spawn-list">
          {rare.spawn_points.map((point, index) => (
            <code key={`${rare.id}-point-${index}`}>
              {point[0]}, {point[1]}
            </code>
          ))}
        </div>
        <div className="rare-actions">
          <a href={rare.wowhead_url} target="_blank" rel="noreferrer" className="btn">
            Ouvrir Wowhead
          </a>
          <Link className="btn btn-secondary" href={`/zone/${rare.zone.slug}`}>
            Retour zone
          </Link>
        </div>
      </article>
    </main>
  );
}
