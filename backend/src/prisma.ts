import { PrismaClient } from "@prisma/client";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Keep SQLite working even when the app is launched from a parent folder.
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
	const abs = path.resolve(__dirname, "../prisma/dev.db").replace(/\\/g, "/");
	process.env.DATABASE_URL = `file:${abs}`;
} else if (dbUrl.startsWith("file:./")) {
	const fileName = dbUrl.slice("file:./".length) || "dev.db";
	const abs = path.resolve(__dirname, `../prisma/${fileName}`).replace(/\\/g, "/");
	process.env.DATABASE_URL = `file:${abs}`;
}

export const prisma = new PrismaClient();
