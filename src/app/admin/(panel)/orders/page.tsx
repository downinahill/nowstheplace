import { prisma } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/format";
import { toggleShipped } from "../../actions";

type Ship = { name?: string; address?: { line1?: string; line2?: string; city?: string; state?: string; postal_code?: string; country?: string } };

export default async function Orders() {
  const orders = await prisma.order.findMany({ where: { status: "PAID" }, orderBy: { createdAt: "desc" }, include: { items: true } });
  return (
    <>
      <h1>Orders</h1>
      {orders.length === 0 ? (
        <p>No orders yet. Paid orders show up here with the shipping address.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Date</th><th>Pieces</th><th>Buyer</th><th>Ship to</th><th>Total</th><th>Shipped</th></tr></thead>
            <tbody>
              {orders.map((o) => {
                const s = (o.shipping ?? {}) as Ship;
                const a = s.address ?? {};
                return (
                  <tr key={o.id}>
                    <td>{formatDate(o.createdAt)}</td>
                    <td>{o.items.map((i) => <div key={i.id} style={{ fontStyle: "italic" }}>{i.title}</div>)}</td>
                    <td>{o.name}<br /><a href={`mailto:${o.email}`}>{o.email}</a></td>
                    <td style={{ fontSize: 14 }}>
                      {s.name}<br />{a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />{a.city}, {a.state} {a.postal_code}
                    </td>
                    <td className="num">{formatPrice(o.amountCents)}</td>
                    <td>
                      <form action={toggleShipped}>
                        <input type="hidden" name="id" value={o.id} />
                        <button className="linkish">{o.shipped ? <span className="pill ok">Shipped</span> : <span className="pill sold">To ship</span>}</button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="mono" style={{ color: "var(--graphite)", marginTop: 12 }}>Refunds are done in your Stripe dashboard.</p>
    </>
  );
}
