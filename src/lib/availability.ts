import type { Artwork } from "@prisma/client";

/** A piece is on hold while someone is in Stripe checkout for it. */
export function isOnHold(a: Pick<Artwork, "reservedUntil">, now = new Date()) {
  return a.reservedUntil != null && a.reservedUntil > now;
}

export function canBuy(a: Pick<Artwork, "status" | "published" | "priceCents" | "reservedUntil">) {
  return a.published && a.status === "AVAILABLE" && a.priceCents != null && !isOnHold(a);
}

export type SaleState = "available" | "on-hold" | "sold" | "inquire";

export function saleState(a: Pick<Artwork, "status" | "priceCents" | "reservedUntil">): SaleState {
  if (a.status === "SOLD") return "sold";
  if (isOnHold(a)) return "on-hold";
  if (a.priceCents == null) return "inquire";
  return "available";
}
