export type ZoneStatus = "too_early" | "check_now" | "overdue";

export type Zone = {
  id: number;
  name: string;
  slug: string;
  respawn_min_hours: number;
  respawn_max_hours: number;
  last_seen_at: string | null;
  earliest_spawn: string | null;
  latest_spawn: string | null;
  status: ZoneStatus;
  latest_rare_seen: { id: number; name: string; npc_id: number } | null;
  latest_seen_at: string | null;
};

export type Rare = {
  id: number;
  name: string;
  npc_id: number;
  zone_id: number;
  wowhead_url: string;
  map_image_url: string | null;
  map_embed_url: string | null;
  spawn_points: number[][];
  needed: boolean;
  completed: boolean;
  notes: string | null;
  tomtom_waypoints: string;
};

export type ZoneDetailResponse = {
  zone: Zone;
  rares: Rare[];
};

export type RareDetailResponse = Rare & {
  zone: { id: number; name: string; slug: string };
};
