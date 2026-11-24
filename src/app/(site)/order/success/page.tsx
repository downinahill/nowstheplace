import Link from "next/link";
import { ClearCartOnMount } from "@/components/cart";

export const metadata = { title: "Thank you" };

export default function SuccessPage() {
  return (
    <section className="wrap page">
      <ClearCartOnMount />
      <h1>Thank you</h1>
      <p className="prose">
        Your order is in. A receipt from Stripe is on its way to your inbox, and you'll get another email when
        your piece ships.
      </p>
      <p style={{ marginTop: 28 }}><Link className="btn ghost" href="/work">Back to the work</Link></p>
    </section>
  );
}
