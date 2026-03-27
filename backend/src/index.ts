import "dotenv/config";
import cors from "cors";
import express from "express";
import { z } from "zod";
import { prisma } from "./prisma.js";
import { serializeRare, serializeZone } from "./serializers.js";

const app = express();
const port = Number(process.env.PORT || 4000);
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";

app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "frostbitten-api" });
});

app.get("/zones", async (_req, res, next) => {
  try {
    const zones = await prisma.zone.findMany({ orderBy: { name: "asc" } });
    const zoneIds = zones.map((zone) => zone.id);
    const sightings = await prisma.sighting.findMany({
      where: { zoneId: { in: zoneIds } },
      orderBy: [{ seenAt: "desc" }],
      include: {
        rare: {
          select: { id: true, name: true, npcId: true },
        },
      },
    });

    const latestByZone = new Map<number, (typeof sightings)[number]>();
    for (const sighting of sightings) {
      if (!latestByZone.has(sighting.zoneId)) {
        latestByZone.set(sighting.zoneId, sighting);
      }
    }

    res.json(zones.map((zone) => serializeZone(zone, latestByZone.get(zone.id) || null)));
  } catch (error) {
    next(error);
  }
});

app.get("/zones/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const zone = await prisma.zone.findUnique({ where: { id } });
    if (!zone) {
      return res.status(404).json({ message: "Zone not found" });
    }

    const latestSighting = await prisma.sighting.findFirst({
      where: { zoneId: id },
      orderBy: { seenAt: "desc" },
      include: {
        rare: {
          select: { id: true, name: true, npcId: true },
        },
      },
    });

    const rares = await prisma.rare.findMany({
      where: { zoneId: id },
      orderBy: [{ completed: "asc" }, { needed: "desc" }, { name: "asc" }],
    });

    return res.json({
      zone: serializeZone(zone, latestSighting),
      rares: rares.map((rare) => serializeRare(rare, zone.name)),
    });
  } catch (error) {
    return next(error);
  }
});

app.patch("/zones/:id/last-seen", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const bodySchema = z.object({
      rareId: z.number().int().positive().optional(),
      seenAt: z.string().datetime().optional(),
    });
    const body = bodySchema.parse(req.body || {});

    const seenAt = body.seenAt ? new Date(body.seenAt) : new Date();

    const zone = await prisma.zone.findUnique({ where: { id } });
    if (!zone) {
      return res.status(404).json({ message: "Zone not found" });
    }

    if (body.rareId) {
      const rare = await prisma.rare.findUnique({ where: { id: body.rareId } });
      if (!rare || rare.zoneId !== id) {
        return res.status(400).json({ message: "rareId is invalid for this zone" });
      }
    }

    const [updatedZone] = await prisma.$transaction([
      prisma.zone.update({
        where: { id },
        data: { lastSeenAt: seenAt },
      }),
      prisma.sighting.create({
        data: {
          zoneId: id,
          rareId: body.rareId,
          seenAt,
        },
      }),
    ]);

    const latestSighting = await prisma.sighting.findFirst({
      where: { zoneId: id },
      orderBy: { seenAt: "desc" },
      include: {
        rare: {
          select: { id: true, name: true, npcId: true },
        },
      },
    });

    return res.json({ zone: serializeZone(updatedZone, latestSighting) });
  } catch (error) {
    return next(error);
  }
});

app.get("/rares", async (req, res, next) => {
  try {
    const querySchema = z.object({
      zoneId: z.coerce.number().int().positive().optional(),
      remainingOnly: z.enum(["true", "false"]).optional(),
      sort: z.enum(["priority", "name"]).optional(),
    });
    const query = querySchema.parse(req.query);

    const where = {
      ...(query.zoneId ? { zoneId: query.zoneId } : {}),
      ...(query.remainingOnly === "true" ? { completed: false, needed: true } : {}),
    };

    const rares = await prisma.rare.findMany({
      where,
      include: { zone: true },
      orderBy: query.sort === "name" ? [{ name: "asc" }] : [{ completed: "asc" }, { needed: "desc" }, { name: "asc" }],
    });

    res.json(rares.map((rare) => serializeRare(rare, rare.zone.name)));
  } catch (error) {
    next(error);
  }
});

app.get("/rares/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const rare = await prisma.rare.findUnique({ where: { id }, include: { zone: true } });
    if (!rare) {
      return res.status(404).json({ message: "Rare not found" });
    }

    return res.json({
      ...serializeRare(rare, rare.zone.name),
      zone: {
        id: rare.zone.id,
        name: rare.zone.name,
        slug: rare.zone.slug,
      },
    });
  } catch (error) {
    return next(error);
  }
});

app.patch("/rares/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const bodySchema = z.object({
      completed: z.boolean().optional(),
      needed: z.boolean().optional(),
      notes: z.string().max(1500).nullable().optional(),
    });
    const body = bodySchema.parse(req.body || {});

    const current = await prisma.rare.findUnique({ where: { id } });
    if (!current) {
      return res.status(404).json({ message: "Rare not found" });
    }

    const rare = await prisma.rare.update({
      where: { id },
      data: {
        ...(body.completed !== undefined ? { completed: body.completed } : {}),
        ...(body.needed !== undefined ? { needed: body.needed } : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
      },
      include: { zone: true },
    });

    return res.json(serializeRare(rare, rare.zone.name));
  } catch (error) {
    return next(error);
  }
});

app.post("/import", async (req, res, next) => {
  try {
    const payloadSchema = z.object({
      zones: z.array(
        z.object({
          name: z.string(),
          slug: z.string(),
          respawn_min_hours: z.number().int().positive(),
          respawn_max_hours: z.number().int().positive(),
          last_seen_at: z.string().datetime().nullable().optional(),
        }),
      ),
      rares: z.array(
        z.object({
          name: z.string(),
          npc_id: z.number().int().positive(),
          zone_slug: z.string(),
          wowhead_url: z.string().url(),
          map_image_url: z.string().url().nullable().optional(),
          map_embed_url: z.string().url().nullable().optional(),
          spawn_points: z.array(z.tuple([z.number(), z.number()])),
          needed: z.boolean(),
          completed: z.boolean(),
          notes: z.string().nullable().optional(),
        }),
      ),
    });

    const payload = payloadSchema.parse(req.body);

    await prisma.$transaction(async (tx) => {
      for (const zone of payload.zones) {
        await tx.zone.upsert({
          where: { slug: zone.slug },
          update: {
            name: zone.name,
            respawnMinHours: zone.respawn_min_hours,
            respawnMaxHours: zone.respawn_max_hours,
            lastSeenAt: zone.last_seen_at ? new Date(zone.last_seen_at) : null,
          },
          create: {
            name: zone.name,
            slug: zone.slug,
            respawnMinHours: zone.respawn_min_hours,
            respawnMaxHours: zone.respawn_max_hours,
            lastSeenAt: zone.last_seen_at ? new Date(zone.last_seen_at) : null,
          },
        });
      }

      const zones = await tx.zone.findMany();
      const zoneMap = new Map(zones.map((zone) => [zone.slug, zone.id]));

      for (const rare of payload.rares) {
        const zoneId = zoneMap.get(rare.zone_slug);
        if (!zoneId) {
          continue;
        }

        await tx.rare.upsert({
          where: { npcId: rare.npc_id },
          update: {
            name: rare.name,
            zoneId,
            wowheadUrl: rare.wowhead_url,
            mapImageUrl: rare.map_image_url || null,
            mapEmbedUrl: rare.map_embed_url || null,
            spawnPoints: rare.spawn_points,
            needed: rare.needed,
            completed: rare.completed,
            notes: rare.notes || null,
          },
          create: {
            name: rare.name,
            npcId: rare.npc_id,
            zoneId,
            wowheadUrl: rare.wowhead_url,
            mapImageUrl: rare.map_image_url || null,
            mapEmbedUrl: rare.map_embed_url || null,
            spawnPoints: rare.spawn_points,
            needed: rare.needed,
            completed: rare.completed,
            notes: rare.notes || null,
          },
        });
      }
    });

    return res.json({ message: "Import completed" });
  } catch (error) {
    return next(error);
  }
});

app.get("/export", async (_req, res, next) => {
  try {
    const zones = await prisma.zone.findMany({ orderBy: { name: "asc" } });
    const rares = await prisma.rare.findMany({ include: { zone: true }, orderBy: { name: "asc" } });

    return res.json({
      zones: zones.map((zone) => ({
        name: zone.name,
        slug: zone.slug,
        respawn_min_hours: zone.respawnMinHours,
        respawn_max_hours: zone.respawnMaxHours,
        last_seen_at: zone.lastSeenAt,
      })),
      rares: rares.map((rare) => ({
        name: rare.name,
        npc_id: rare.npcId,
        zone_slug: rare.zone.slug,
        wowhead_url: rare.wowheadUrl,
        map_image_url: rare.mapImageUrl,
        map_embed_url: rare.mapEmbedUrl,
        spawn_points: rare.spawnPoints,
        needed: rare.needed,
        completed: rare.completed,
        notes: rare.notes,
      })),
    });
  } catch (error) {
    return next(error);
  }
});

app.post("/jobs/recompute", async (req, res) => {
  const auth = req.headers.authorization || "";
  const expected = `Bearer ${process.env.JOBS_SECRET || ""}`;

  if (!process.env.JOBS_SECRET || auth !== expected) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const zones = await prisma.zone.findMany({ select: { id: true } });
  return res.json({ ok: true, zonesChecked: zones.length, timestamp: new Date().toISOString() });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof z.ZodError) {
    return res.status(400).json({ message: "Validation error", issues: error.issues });
  }

  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Frostbitten API listening on port ${port}`);
});
