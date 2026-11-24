"use server";

import { prisma } from "@/lib/db";

export type ContactState = { ok: boolean; error?: string };

export async function sendInquiry(form: FormData): Promise<ContactState> {
  // Simple bot trap: real people never see or fill the "website" field.
  if (String(form.get("website") || "")) return { ok: true };

  const name = String(form.get("name") || "").trim().slice(0, 120);
  const email = String(form.get("email") || "").trim().slice(0, 200);
  const message = String(form.get("message") || "").trim().slice(0, 5000);
  const artworkId = String(form.get("artworkId") || "") || null;

  if (!name || !message) return { ok: false, error: "Add your name and a message." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "That email address doesn't look right." };

  await prisma.inquiry.create({ data: { name, email, message, artworkId } });
  return { ok: true };
}
