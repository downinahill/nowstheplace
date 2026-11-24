// Adds the starting artworks the first time the database is empty.
// Safe to run on every deploy: it does nothing once artworks exist.
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";

const prisma = new PrismaClient();
const data = JSON.parse(readFileSync(new URL("./seed-data.json", import.meta.url), "utf8"));

async function main() {
  await prisma.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
  const count = await prisma.artwork.count();
  if (count > 0) {
    console.log(`Seed skipped: ${count} artworks already in the database.`);
    return;
  }
  for (const a of data) {
    await prisma.artwork.create({ data: a });
  }
  console.log(`Seeded ${data.length} artworks.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
