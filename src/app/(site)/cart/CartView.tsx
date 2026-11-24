"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart";
import { formatPrice } from "@/lib/format";

export function CartView({ shippingCents }: { shippingCents: number }) {
  const { items, remove, ready } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ready) return null;
  if (items.length === 0) {
    return (
      <div>
        <p className="prose">Your cart is empty.</p>
        <p style={{ marginTop: 24 }}><Link className="btn" href="/work?show=available">See available work</Link></p>
      </div>
    );
  }

  const subtotal = items.reduce((s, i) => s + i.priceCents, 0);

  async function checkout() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: items.map((i) => i.id) }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Drop pieces that sold or went on hold since they were added.
        (data.unavailable as string[] | undefined)?.forEach((id) => remove(id));
        throw new Error(data.error || "Checkout didn't start. Try again.");
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout didn't start. Try again.");
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 820 }}>
      {items.map((i) => (
        <div className="cart-line" key={i.id}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={i.imageUrl} alt="" width={96} height={96} style={{ objectFit: "cover", aspectRatio: "1" }} />
          <div>
            <Link href={`/work/${i.slug}`} style={{ fontStyle: "italic", fontSize: 19 }}>{i.title}</Link>
            <div><button className="linkish" onClick={() => remove(i.id)}>Remove</button></div>
          </div>
          <span className="mono">{formatPrice(i.priceCents)}</span>
        </div>
      ))}
      <div className="totals">
        <div><span>Subtotal</span><span className="mono">{formatPrice(subtotal)}</span></div>
        <div><span>Insured shipping</span><span className="mono">{formatPrice(shippingCents)}</span></div>
        <div className="grand"><span>Total</span><span className="mono">{formatPrice(subtotal + shippingCents)}</span></div>
      </div>
      {error && <p className="notice error" style={{ marginBottom: 16 }}>{error}</p>}
      <div style={{ maxWidth: 420, marginLeft: "auto" }}>
        <button className="btn block" onClick={checkout} disabled={busy}>
          {busy ? "Opening secure checkout…" : "Check out"}
        </button>
        <p className="mono" style={{ color: "var(--graphite)", marginTop: 10, textAlign: "center" }}>
          Payment handled by Stripe
        </p>
      </div>
    </div>
  );
}
