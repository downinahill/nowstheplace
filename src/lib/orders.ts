import type Stripe from "stripe";
import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { stripe } from "./stripe";

/** Ends a checkout that didn't complete and puts its pieces back on sale. */
export async function releaseOrder(orderId: string, opts: { expireStripeSession?: boolean } = {}) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order || order.status !== "PENDING") return;

  if (opts.expireStripeSession && order.stripeSessionId.startsWith("cs_")) {
    try {
      await stripe().checkout.sessions.expire(order.stripeSessionId);
    } catch {
      // Already expired or completed; the webhook will settle it.
      const s = await stripe().checkout.sessions.retrieve(order.stripeSessionId).catch(() => null);
      if (s?.payment_status === "paid") return;
    }
  }

  await prisma.$transaction([
    prisma.order.update({ where: { id: order.id }, data: { status: "EXPIRED" } }),
    prisma.artwork.updateMany({
      where: { id: { in: order.items.map((i) => i.artworkId) }, status: "AVAILABLE" },
      data: { reservedUntil: null },
    }),
  ]);
}

export async function markOrderPaid(session: Stripe.Checkout.Session) {
  const order = await prisma.order.findUnique({ where: { stripeSessionId: session.id }, include: { items: true } });
  if (!order || order.status === "PAID") return;

  // Field name differs between Stripe API versions, so read both.
  const s = session as Stripe.Checkout.Session & { collected_information?: { shipping_details?: unknown } };
  const shipping = (s.shipping_details ?? s.collected_information?.shipping_details ?? null) as Prisma.InputJsonValue | null;

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        email: session.customer_details?.email ?? null,
        name: session.customer_details?.name ?? null,
        shipping: shipping ?? undefined,
        amountCents: session.amount_total ?? 0,
      },
    }),
    prisma.artwork.updateMany({
      where: { id: { in: order.items.map((i) => i.artworkId) } },
      data: { status: "SOLD", reservedUntil: null },
    }),
  ]);
}
