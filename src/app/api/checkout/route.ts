import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canBuy } from "@/lib/availability";
import { getSettings } from "@/lib/settings";
import { releaseOrder } from "@/lib/orders";
import { siteUrl, stripe } from "@/lib/stripe";

const HOLD_MINUTES = 32; // a little longer than the Stripe session (31 min)

export async function POST(req: Request) {
  let ids: string[];
  try {
    const body = await req.json();
    ids = Array.from(new Set((body.ids as unknown[]).filter((x): x is string => typeof x === "string")));
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  if (ids.length === 0 || ids.length > 20) return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });

  const now = new Date();
  const holdUntil = new Date(now.getTime() + HOLD_MINUTES * 60_000);

  // Put the pieces on hold so two people can't buy the same original.
  const held = await prisma
    .$transaction(async (tx) => {
      const arts = await tx.artwork.findMany({ where: { id: { in: ids } } });
      const unavailable = ids.filter((id) => {
        const a = arts.find((x) => x.id === id);
        return !a || !canBuy(a);
      });
      if (unavailable.length) return { unavailable };
      const res = await tx.artwork.updateMany({
        where: { id: { in: ids }, status: "AVAILABLE", OR: [{ reservedUntil: null }, { reservedUntil: { lt: now } }] },
        data: { reservedUntil: holdUntil },
      });
      if (res.count !== ids.length) throw new Error("race");
      const order = await tx.order.create({
        data: {
          stripeSessionId: `pending_${crypto.randomUUID()}`,
          items: { create: arts.map((a) => ({ artworkId: a.id, title: a.title, priceCents: a.priceCents! })) },
        },
      });
      return { arts, order };
    })
    .catch(() => ({ unavailable: ids }));

  if ("unavailable" in held) {
    return NextResponse.json(
      { error: "A piece in your cart just sold or is on hold, so it was removed.", unavailable: held.unavailable },
      { status: 409 },
    );
  }

  const { arts, order } = held;
  const settings = await getSettings();
  const base = siteUrl();

  try {
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: arts.map((a) => ({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: a.priceCents!,
          product_data: {
            name: a.title,
            description: `${a.medium}${a.size ? `, ${a.size}` : ""}. Original artwork.`,
            images: [a.imageUrl.startsWith("http") ? a.imageUrl : base + a.imageUrl],
          },
        },
      })),
      shipping_address_collection: { allowed_countries: ["US"] },
      shipping_options:
        settings.shippingCents > 0
          ? [{ shipping_rate_data: { type: "fixed_amount", display_name: "Insured shipping", fixed_amount: { amount: settings.shippingCents, currency: "usd" } } }]
          : undefined,
      phone_number_collection: { enabled: true },
      expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
      metadata: { orderId: order.id },
      success_url: `${base}/order/success`,
      cancel_url: `${base}/api/checkout/cancel?order=${order.id}`,
    });
    await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Stripe checkout failed", e);
    await releaseOrder(order.id);
    return NextResponse.json({ error: "Checkout is unavailable right now. Try again in a minute." }, { status: 502 });
  }
}
