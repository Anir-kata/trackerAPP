"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Rare, Zone } from "@/lib/types";
import { TimerPanel } from "./TimerPanel";
import { ZoneSidebar } from "./ZoneSidebar";
import { RareCard } from "./RareCard";

type Props = {
  defaultZoneSlug?: string;
};

export function DashboardClient({ defaultZoneSlug }: Props) {
  const [zones, setZones] = useState<Zone[]>([]);
  const [activeZone, setActiveZone] = useState<Zone | null>(null);
  const [rares, setRares] = useState<Rare[]>([]);
  const [remainingOnly, setRemainingOnly] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeSlug = useMemo(() => activeZone?.slug || defaultZoneSlug, [activeZone?.slug, defaultZoneSlug]);

  const refreshZoneDetails = async (zone: Zone) => {
    const details = await api.getZoneById(zone.id);
    setActiveZone(details.zone);
    setRares(details.rares);
  };

  const refreshAll = async () => {
    const zoneRows = await api.getZones();
    setZones(zoneRows);

    const picked = defaultZoneSlug
      ? zoneRows.find((zone) => zone.slug === defaultZoneSlug)
      : zoneRows[0];

    if (picked) {
      await refreshZoneDetails(picked);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("remainingOnly");
    if (stored === "true") setRemainingOnly(true);
    if (stored === "false") setRemainingOnly(false);

    refreshAll().catch((err) => setError(err instanceof Error ? err.message : "Erreur API"));
  }, [defaultZoneSlug]);

  const displayRares = useMemo(() => {
    return rares.filter((rare) => (remainingOnly ? !rare.completed && rare.needed : true));
  }, [rares, remainingOnly]);

  const onToggleCompleted = async (rare: Rare, completed: boolean) => {
    try {
      await api.patchRare(rare.id, { completed });
      if (activeZone) await refreshZoneDetails(activeZone);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de mise a jour");
    }
  };

  const onSeenNow = async (rare: Rare) => {
    if (!activeZone) return;
    try {
      await api.patchZoneLastSeen(activeZone.id, rare.id);
      await refreshAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de timer");
    }
  };

  const onSaveNotes = async (rare: Rare, notes: string) => {
    try {
      await api.patchRare(rare.id, { notes });
      if (activeZone) await refreshZoneDetails(activeZone);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de note");
    }
  };

  if (error) {
    return <main className="page-shell">Erreur: {error}</main>;
  }

  if (!activeZone) {
    return <main className="page-shell">Chargement...</main>;
  }

  return (
    <main className="page-shell">
      <ZoneSidebar zones={zones} activeSlug={activeSlug} />

      <section className="content-column">
        <header className="panel content-header">
          <h1>Frostbitten Tracker</h1>
          <p>Warmane WotLK 3.3.5 - flashcards de rares par zone et suivi temps reel</p>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={remainingOnly}
              onChange={(event) => {
                setRemainingOnly(event.target.checked);
                localStorage.setItem("remainingOnly", String(event.target.checked));
              }}
            />
            Rares restants seulement
          </label>
        </header>

        <div className="rares-grid">
          {displayRares.map((rare) => (
            <RareCard
              key={rare.id}
              rare={rare}
              onToggleCompleted={onToggleCompleted}
              onSeenNow={onSeenNow}
              onSaveNotes={onSaveNotes}
            />
          ))}
        </div>
      </section>

      <TimerPanel zone={activeZone} />
    </main>
  );
}
