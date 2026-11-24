import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { markOrderPaid, releaseOrder } from "@/lib/orders";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  if (!secret || !sig) return NextResponse.json({ error: "Not configured" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await req.text(), sig, secret);
  } catch {
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      if (session.payment_status === "paid") await markOrderPaid(session);
      break;
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      const order = await prisma.order.findUnique({ where: { stripeSessionId: session.id } });
      if (order) await releaseOrder(order.id);
      break;
    }
  }
  return NextResponse.json({ received: true });
}
