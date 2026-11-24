import { prisma } from "./db";

export async function getSettings() {
  const s = await prisma.settings.findUnique({ where: { id: 1 } });
  return s ?? (await prisma.settings.create({ data: { id: 1 } }));
}
