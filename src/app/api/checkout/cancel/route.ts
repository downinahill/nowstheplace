import { NextResponse } from "next/server";
import { releaseOrder } from "@/lib/orders";

// Stripe sends buyers here when they press "back" on the checkout page.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("order");
  if (orderId) await releaseOrder(orderId, { expireStripeSession: true }).catch(() => {});
  return NextResponse.redirect(new URL("/cart?canceled=1", url));
}
