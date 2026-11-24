"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { del, put } from "@vercel/blob";
import type { ArtStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { createSessionValue, passwordMatches, SESSION_COOKIE } from "@/lib/session";
import { slugify } from "@/lib/format";

/* ---------- Login ---------- */

export async function login(form: FormData): Promise<{ error?: string }> {
  const ok = await passwordMatches(String(form.get("password") || ""));
  if (!ok) {
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    return { error: "Wrong password." };
  }
  const { value, maxAge } = await createSessionValue();
  cookies().set(SESSION_COOKIE, value, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge });
  redirect("/admin");
}

export async function logout() {
  cookies().delete(SESSION_COOKIE);
  redirect("/admin/login");
}

/* ---------- Artworks ---------- */

function parseDollars(v: FormDataEntryValue | null) {
  const s = String(v ?? "").replace(/[$,\s]/g, "");
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) throw new Error("Price must be a number, like 450.");
  return Math.round(n * 100);
}

async function uniqueSlug(base: string, ignoreId?: string) {
  let slug = base;
  for (let i = 2; ; i++) {
    const hit = await prisma.artwork.findUnique({ where: { slug } });
    if (!hit || hit.id === ignoreId) return slug;
    slug = `${base}-${i}`;
  }
}

export type SaveState = { error?: string };

export async function saveArtwork(form: FormData): Promise<SaveState> {
  await requireAdmin();
  const id = String(form.get("id") || "") || null;
  const title = String(form.get("title") || "").trim();
  const medium = String(form.get("medium") || "").trim();
  if (!title || !medium) return { error: "Title and medium are required." };

  let priceCents: number | null;
  try {
    priceCents = parseDollars(form.get("price"));
  } catch (e) {
    return { error: (e as Error).message };
  }
  const yearRaw = String(form.get("year") || "").trim();
  const year = yearRaw ? Number(yearRaw) : null;
  if (year != null && (!Number.isInteger(year) || year < 1900 || year > 2100)) return { error: "Year looks wrong." };

  const status: ArtStatus = form.get("status") === "SOLD" ? "SOLD" : "AVAILABLE";
  const data = {
    title,
    medium,
    size: String(form.get("size") || "").trim() || null,
    year,
    description: String(form.get("description") || "").trim(),
    priceCents,
    status,
    published: form.get("published") === "on",
    featured: form.get("featured") === "on",
  };

  const image = form.get("image");
  let imageFields: { imageUrl: string; imageWidth: number; imageHeight: number } | null = null;
  if (image instanceof File && image.size > 0) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) return { error: "Image uploads need Vercel Blob. See the README, step 4." };
    const blob = await put(`art/${slugify(title)}-${Date.now()}.jpg`, image, { access: "public", contentType: image.type || "image/jpeg" });
    imageFields = {
      imageUrl: blob.url,
      imageWidth: Number(form.get("imageWidth")) || 1600,
      imageHeight: Number(form.get("imageHeight")) || 1600,
    };
  }

  if (id) {
    const old = await prisma.artwork.findUnique({ where: { id } });
    if (!old) return { error: "That piece no longer exists." };
    await prisma.artwork.update({
      where: { id },
      data: { ...data, ...(imageFields ?? {}), ...(status === "SOLD" ? { reservedUntil: null } : {}) },
    });
    if (imageFields && old.imageUrl.includes("blob.vercel-storage.com")) await del(old.imageUrl).catch(() => {});
  } else {
    if (!imageFields) return { error: "Add a photo of the piece." };
    const last = await prisma.artwork.findFirst({ orderBy: { number: "desc" }, select: { number: true } });
    await prisma.artwork.create({
      data: { ...data, ...imageFields, number: (last?.number ?? 0) + 1, slug: await uniqueSlug(slugify(title)) },
    });
  }
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function deleteArtwork(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id"));
  const art = await prisma.artwork.findUnique({ where: { id }, include: { _count: { select: { orderItems: true } } } });
  if (!art) redirect("/admin");
  if (art._count.orderItems > 0) {
    // Keep sold pieces for your order records; just hide them.
    await prisma.artwork.update({ where: { id }, data: { published: false } });
  } else {
    await prisma.artwork.delete({ where: { id } });
    if (art.imageUrl.includes("blob.vercel-storage.com")) await del(art.imageUrl).catch(() => {});
  }
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function toggleArtwork(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id"));
  const field = String(form.get("field"));
  const art = await prisma.artwork.findUnique({ where: { id } });
  if (!art) return;
  if (field === "published") await prisma.artwork.update({ where: { id }, data: { published: !art.published } });
  if (field === "featured") await prisma.artwork.update({ where: { id }, data: { featured: !art.featured } });
  if (field === "status")
    await prisma.artwork.update({ where: { id }, data: { status: art.status === "SOLD" ? "AVAILABLE" : "SOLD", reservedUntil: null } });
  revalidatePath("/", "layout");
}

/* ---------- Orders and inquiries ---------- */

export async function toggleShipped(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id"));
  const o = await prisma.order.findUnique({ where: { id } });
  if (o) await prisma.order.update({ where: { id }, data: { shipped: !o.shipped } });
  revalidatePath("/admin/orders");
}

export async function toggleInquiryRead(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id"));
  const q = await prisma.inquiry.findUnique({ where: { id } });
  if (q) await prisma.inquiry.update({ where: { id }, data: { read: !q.read } });
  revalidatePath("/admin/inquiries");
}

export async function deleteInquiry(form: FormData) {
  await requireAdmin();
  await prisma.inquiry.delete({ where: { id: String(form.get("id")) } }).catch(() => {});
  revalidatePath("/admin/inquiries");
}

/* ---------- Site settings ---------- */

export async function saveSettings(form: FormData): Promise<{ ok?: boolean; error?: string }> {
  await requireAdmin();
  const get = (k: string) => String(form.get(k) || "").trim();
  if (!get("siteName") || !get("artistName")) return { error: "Site name and artist name are required." };
  let shippingCents: number;
  try {
    shippingCents = parseDollars(form.get("shipping")) ?? 0;
  } catch {
    return { error: "Shipping must be a number, like 25." };
  }
  await prisma.settings.upsert({
    where: { id: 1 },
    create: { id: 1 },
    update: {
      siteName: get("siteName"),
      artistName: get("artistName"),
      tagline: get("tagline"),
      bio: get("bio"),
      contactEmail: get("contactEmail"),
      instagram: get("instagram").replace(/^@/, ""),
      shippingCents,
    },
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
