"use client";

import Link from "next/link";
import { useCart, type CartItem } from "./cart";

export function AddToCart({ item }: { item: CartItem }) {
  const { add, has, ready } = useCart();
  const inCart = ready && has(item.id);
  if (inCart) {
    return (
      <Link className="btn block ghost" href="/cart">
        In your cart · Check out
      </Link>
    );
  }
  return (
    <button className="btn block" type="button" onClick={() => add(item)} disabled={!ready}>
      Add to cart
    </button>
  );
}
