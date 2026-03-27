"use client";

import Link from "next/link";
import type { Zone } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

type Props = {
  zones: Zone[];
  activeSlug?: string;
};

export function ZoneSidebar({ zones, activeSlug }: Props) {
  return (
    <aside className="panel sidebar">
      <h2 className="panel-title">Zones Norfendre</h2>
      <ul className="zone-list">
        {zones.map((zone) => (
          <li key={zone.id}>
            <Link
              href={`/zone/${zone.slug}`}
              className={`zone-link ${activeSlug === zone.slug ? "zone-link-active" : ""}`}
            >
              <span>{zone.name}</span>
              <StatusBadge status={zone.status} />
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
