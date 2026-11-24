"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: string;
  slug: string;
  title: string;
  priceCents: number;
  imageUrl: string;
};

type CartCtx = {
  items: CartItem[];
  ready: boolean;
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "ntp-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  // Originals are one of a kind, so each piece can only be in the cart once.
  const add = useCallback((item: CartItem) => setItems((cur) => (cur.some((i) => i.id === item.id) ? cur : [...cur, item])), []);
  const remove = useCallback((id: string) => setItems((cur) => cur.filter((i) => i.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);
  const has = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  const value = useMemo(() => ({ items, ready, add, remove, clear, has }), [items, ready, add, remove, clear, has]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}

export function CartCount() {
  const { items, ready } = useCart();
  return <>Cart{ready && items.length > 0 ? ` (${items.length})` : ""}</>;
}

export function ClearCartOnMount() {
  const { clear } = useCart();
  useEffect(() => clear(), [clear]);
  return null;
}
