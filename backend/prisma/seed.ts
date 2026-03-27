import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

type ZoneRow = {
  id: number;
  name: string;
};

const zoneMaps: Record<string, string> = {
  "Howling Fjord": "https://wow.zamimg.com/images/wow/maps/enus/normal/495.jpg",
  "Borean Tundra": "https://wow.zamimg.com/images/wow/maps/enus/normal/3537.jpg",
  Dragonblight: "https://wow.zamimg.com/images/wow/maps/enus/normal/65.jpg",
  "Grizzly Hills": "https://wow.zamimg.com/images/wow/maps/enus/normal/394.jpg",
  "Sholazar Basin": "https://wow.zamimg.com/images/wow/maps/enus/normal/3711.jpg",
  "The Storm Peaks": "https://wow.zamimg.com/images/wow/maps/enus/normal/67.jpg",
  ZulDrak: "https://wow.zamimg.com/images/wow/maps/enus/normal/66.jpg",
  Icecrown: "https://wow.zamimg.com/images/wow/maps/enus/normal/210.jpg",
  Crystalsong: "https://wow.zamimg.com/images/wow/maps/enus/normal/2817.jpg",
  Wintergrasp: "https://wow.zamimg.com/images/wow/maps/enus/normal/4197.jpg",
};

const zones = [
  { name: "Borean Tundra", respawnMinHours: 4, respawnMaxHours: 8 },
  { name: "Howling Fjord", respawnMinHours: 4, respawnMaxHours: 8 },
  { name: "Dragonblight", respawnMinHours: 4, respawnMaxHours: 8 },
  { name: "Grizzly Hills", respawnMinHours: 4, respawnMaxHours: 8 },
  { name: "ZulDrak", respawnMinHours: 4, respawnMaxHours: 8 },
  { name: "Sholazar Basin", respawnMinHours: 4, respawnMaxHours: 8 },
  { name: "The Storm Peaks", respawnMinHours: 4, respawnMaxHours: 8 },
  { name: "Icecrown", respawnMinHours: 4, respawnMaxHours: 8 },
  { name: "Crystalsong", respawnMinHours: 4, respawnMaxHours: 8 },
  { name: "Wintergrasp", respawnMinHours: 4, respawnMaxHours: 8 },
];

const rares = [
  { name: "Aotona", npcId: 32481, zone: "Sholazar Basin", points: [[36, 30], [47, 44], [53, 52], [61, 79]] },
  { name: "Loque'nahak", npcId: 32517, zone: "Sholazar Basin", points: [[50, 81], [36, 30], [66, 77], [71, 71], [58, 22]] },
  { name: "King Krush", npcId: 32485, zone: "Sholazar Basin", points: [[28, 45], [50, 50], [67, 27], [42, 67]] },
  { name: "Arcturis", npcId: 38453, zone: "Grizzly Hills", points: [[31, 55]] },
  { name: "Gondria", npcId: 33776, zone: "ZulDrak", points: [[69, 49], [63, 43], [77, 70], [75, 62]] },
  { name: "Skoll", npcId: 35189, zone: "The Storm Peaks", points: [[30, 64], [45, 62], [27, 50]] },
  { name: "Dirkee", npcId: 32500, zone: "The Storm Peaks", points: [[38, 59], [35, 76], [50, 65]] },
  { name: "Vyragosa", npcId: 32630, zone: "The Storm Peaks", points: [[27, 50], [45, 62], [30, 64], [47, 77]] },
  { name: "Time-Lost Proto-Drake", npcId: 32491, zone: "The Storm Peaks", points: [[29, 50], [45, 62], [31, 69], [52, 35]] },
  { name: "Fumblub Gearwind", npcId: 32358, zone: "Borean Tundra", points: [[68, 49], [71, 37], [62, 31]] },
  { name: "Old Crystalbark", npcId: 32357, zone: "Borean Tundra", points: [[47, 33], [53, 22], [40, 19]] },
  { name: "Crazed Indu'le Survivor", npcId: 32409, zone: "Dragonblight", points: [[67, 46], [72, 39], [64, 41]] },
  { name: "Griegen", npcId: 32471, zone: "Howling Fjord", points: [[48, 26], [56, 24], [61, 35]] },
  { name: "Perobas the Bloodthirster", npcId: 32386, zone: "Borean Tundra", points: [[69, 44], [72, 49], [77, 48]] },
  { name: "Frostbitten Matriarch", npcId: 32361, zone: "Borean Tundra", points: [[42, 55], [39, 43], [33, 53]] },
  { name: "Vigdis the War Maiden", npcId: 32364, zone: "Howling Fjord", points: [[51, 6], [56, 8], [50, 14]] },
  { name: "King Ping", npcId: 32487, zone: "Borean Tundra", points: [[65, 14], [58, 13], [52, 9]] },
  { name: "Putridus the Ancient", npcId: 32398, zone: "Howling Fjord", points: [[57, 52], [62, 62], [49, 64]] },
  { name: "Hildana Deathstealer", npcId: 32495, zone: "Howling Fjord", points: [[49, 36], [45, 31], [53, 30]] },
  { name: "Scarlet Highlord Daion", npcId: 32417, zone: "Dragonblight", points: [[84, 26], [87, 23], [79, 28]] },
  { name: "Terror Spinner", npcId: 32475, zone: "ZulDrak", points: [[77, 45], [72, 52], [63, 49]] },
  { name: "Grubthor", npcId: 32400, zone: "Grizzly Hills", points: [[50, 35], [43, 31], [54, 29]] },
  { name: "Seething Hate", npcId: 32429, zone: "Icecrown", points: [[64, 43], [58, 47], [52, 42]] },
  { name: "Frostpaw", npcId: 32503, zone: "Grizzly Hills", points: [[63, 24], [67, 27], [59, 20]] },
  { name: "Grocklar", npcId: 32422, zone: "Grizzly Hills", points: [[69, 46], [74, 42], [63, 40]] },
  { name: "High Thane Jorfus", npcId: 32501, zone: "Icecrown", points: [[38, 41], [33, 39], [44, 37]] },
  { name: "Aurelia", npcId: 38599, zone: "Crystalsong", points: [[36, 57], [41, 64], [29, 50]] },
  { name: "Dreadtalon", npcId: 33829, zone: "Wintergrasp", points: [[59, 35], [49, 21], [68, 42]] },
  { name: "Vyraxxis", npcId: 43593, zone: "Wintergrasp", points: [[43, 25], [55, 17], [69, 33]] },
  { name: "Gondria's Shadow", npcId: 38902, zone: "Crystalsong", points: [[22, 45], [34, 35], [41, 50]] },
];

function wowheadUrl(npcId: number, name: string) {
  const slug = name.toLowerCase().replaceAll("'", "").replaceAll(" ", "-");
  return `https://www.wowhead.com/wotlk/fr/npc=${npcId}/${slug}#map`;
}

async function main() {
  for (const zone of zones) {
    await prisma.zone.upsert({
      where: { slug: slugify(zone.name, { lower: true, strict: true }) },
      update: {
        name: zone.name,
        respawnMinHours: zone.respawnMinHours,
        respawnMaxHours: zone.respawnMaxHours,
      },
      create: {
        name: zone.name,
        slug: slugify(zone.name, { lower: true, strict: true }),
        respawnMinHours: zone.respawnMinHours,
        respawnMaxHours: zone.respawnMaxHours,
      },
    });
  }

  const zoneRows: ZoneRow[] = await prisma.zone.findMany();
  const zoneMap = new Map<string, ZoneRow>(zoneRows.map((zone: ZoneRow) => [zone.name, zone]));

  for (const rare of rares) {
    const zone = zoneMap.get(rare.zone);
    if (!zone) {
      continue;
    }

    await prisma.rare.upsert({
      where: { npcId: rare.npcId },
      update: {
        name: rare.name,
        zoneId: zone.id,
        wowheadUrl: wowheadUrl(rare.npcId, rare.name),
        mapImageUrl: zoneMaps[rare.zone] ?? null,
        spawnPoints: rare.points,
        needed: true,
        completed: false,
      },
      create: {
        name: rare.name,
        npcId: rare.npcId,
        zoneId: zone.id,
        wowheadUrl: wowheadUrl(rare.npcId, rare.name),
        mapImageUrl: zoneMaps[rare.zone] ?? null,
        spawnPoints: rare.points,
        needed: true,
        completed: false,
      },
    });
  }

  console.log(`Seed complete: ${zones.length} zones, ${rares.length} rares.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
