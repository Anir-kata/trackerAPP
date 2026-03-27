import type { Rare, Zone } from "@prisma/client";
import { computeWindow, getTomTomWaypoints } from "./prediction.js";

type LatestSighting = {
  rareId: number | null;
  seenAt: Date;
  rare?: {
    id: number;
    name: string;
    npcId: number;
  } | null;
} | null;

export function serializeZone(zone: Zone, latestSighting: LatestSighting) {
  const window = computeWindow(zone.lastSeenAt, zone.respawnMinHours, zone.respawnMaxHours);

  return {
    id: zone.id,
    name: zone.name,
    slug: zone.slug,
    respawn_min_hours: zone.respawnMinHours,
    respawn_max_hours: zone.respawnMaxHours,
    last_seen_at: zone.lastSeenAt,
    earliest_spawn: window.earliestSpawn,
    latest_spawn: window.latestSpawn,
    status: window.status,
    latest_rare_seen: latestSighting?.rare
      ? {
          id: latestSighting.rare.id,
          name: latestSighting.rare.name,
          npc_id: latestSighting.rare.npcId,
        }
      : null,
    latest_seen_at: latestSighting?.seenAt ?? null,
  };
}

export function serializeRare(rare: Rare, zoneName: string) {
  const points = (rare.spawnPoints as number[][]) || [];

  return {
    id: rare.id,
    name: rare.name,
    npc_id: rare.npcId,
    zone_id: rare.zoneId,
    wowhead_url: rare.wowheadUrl,
    map_image_url: rare.mapImageUrl,
    map_embed_url: rare.mapEmbedUrl,
    spawn_points: points,
    needed: rare.needed,
    completed: rare.completed,
    notes: rare.notes,
    tomtom_waypoints: getTomTomWaypoints(zoneName, points),
  };
}
