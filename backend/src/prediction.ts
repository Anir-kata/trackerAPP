export type ZoneStatus = "too_early" | "check_now" | "overdue";

export function computeWindow(lastSeenAt: Date | null, minHours: number, maxHours: number, now = new Date()) {
  if (!lastSeenAt) {
    return {
      earliestSpawn: null,
      latestSpawn: null,
      status: "overdue" as ZoneStatus,
    };
  }

  const earliestSpawn = new Date(lastSeenAt.getTime() + minHours * 60 * 60 * 1000);
  const latestSpawn = new Date(lastSeenAt.getTime() + maxHours * 60 * 60 * 1000);

  let status: ZoneStatus = "too_early";
  if (now >= earliestSpawn && now <= latestSpawn) {
    status = "check_now";
  } else if (now > latestSpawn) {
    status = "overdue";
  }

  return {
    earliestSpawn,
    latestSpawn,
    status,
  };
}

export function getTomTomWaypoints(zoneName: string, points: number[][]) {
  return points.map(([x, y]) => `/way ${zoneName} ${x} ${y}`).join("\n");
}
