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
  const [selectedRare, setSelectedRare] = useState<Rare | null>(null);
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
    refreshAll().catch((err) => setError(err instanceof Error ? err.message : "Erreur API"));
  }, [defaultZoneSlug]);

  const onComplete = async (rare: Rare) => {
    try {
      await api.patchRare(rare.id, { completed: true });
      if (activeZone) await refreshZoneDetails(activeZone);
      setSelectedRare(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de mise a jour");
    }
  };

  const onSeenNow = async (rare: Rare) => {
    if (!activeZone) return;
    try {
      await api.patchZoneLastSeen(activeZone.id, rare.id);
      await refreshAll();
      setSelectedRare(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de timer");
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
        </header>

        <div className="rares-grid">
          {rares.map((rare) => (
            <RareCard
              key={rare.id}
              rare={rare}
              onRequestAction={setSelectedRare}
            />
          ))}
        </div>
      </section>

      <TimerPanel zone={activeZone} />

      {selectedRare ? (
        <div className="modal-backdrop" onClick={() => setSelectedRare(null)}>
          <div className="modal-spiral" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <h3>{selectedRare.name}</h3>
            <p>Choisir une action</p>
            <div className="confirm-actions">
              <button type="button" className="btn" onClick={() => onSeenNow(selectedRare)}>
                Seen
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => onComplete(selectedRare)}>
                Complete
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedRare(null)}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
