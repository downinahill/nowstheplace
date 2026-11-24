import { getSettings } from "@/lib/settings";
import { CartView } from "./CartView";

export const metadata = { title: "Cart" };

export default async function CartPage({ searchParams }: { searchParams: { canceled?: string } }) {
  const s = await getSettings();
  return (
    <section className="wrap page">
      <h1>Cart</h1>
      {searchParams.canceled && <p className="notice" style={{ marginBottom: 20 }}>Checkout canceled. Your cart is still here.</p>}
      <CartView shippingCents={s.shippingCents} />
    </section>
  );
}
