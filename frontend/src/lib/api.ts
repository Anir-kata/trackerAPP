import type { Rare, RareDetailResponse, Zone, ZoneDetailResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `API error: ${response.status}`);
  }

  return (await response.json()) as T;
}

export const api = {
  getZones: () => request<Zone[]>("/zones"),
  getZoneById: (id: number) => request<ZoneDetailResponse>(`/zones/${id}`),
  patchZoneLastSeen: (id: number, rareId?: number) =>
    request<{ zone: Zone }>(`/zones/${id}/last-seen`, {
      method: "PATCH",
      body: JSON.stringify({ rareId }),
    }),
  getRares: (params?: { zoneId?: number; remainingOnly?: boolean; sort?: "priority" | "name" }) => {
    const search = new URLSearchParams();
    if (params?.zoneId) search.set("zoneId", String(params.zoneId));
    if (params?.remainingOnly !== undefined) search.set("remainingOnly", String(params.remainingOnly));
    if (params?.sort) search.set("sort", params.sort);
    return request<Rare[]>(`/rares${search.size ? `?${search.toString()}` : ""}`);
  },
  getRareById: (id: number) => request<RareDetailResponse>(`/rares/${id}`),
  patchRare: (id: number, payload: Partial<Pick<Rare, "completed" | "needed" | "notes">>) =>
    request<Rare>(`/rares/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  exportJson: () => request<{ zones: unknown[]; rares: unknown[] }>("/export"),
  importJson: (payload: unknown) =>
    request<{ message: string }>("/import", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
