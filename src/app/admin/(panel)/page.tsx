import Link from "next/link";
import { prisma } from "@/lib/db";
import { catalogNo, formatPrice } from "@/lib/format";
import { isOnHold } from "@/lib/availability";
import { toggleArtwork } from "../actions";

function Toggle({ id, field, children }: { id: string; field: string; children: React.ReactNode }) {
  return (
    <form action={toggleArtwork}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="field" value={field} />
      <button className="linkish" title="Click to change">{children}</button>
    </form>
  );
}

export default async function AdminHome() {
  const [works, paid, unread] = await Promise.all([
    prisma.artwork.findMany({ orderBy: { number: "desc" } }),
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { amountCents: true }, _count: true }),
    prisma.inquiry.count({ where: { read: false } }),
  ]);
  const available = works.filter((w) => w.status === "AVAILABLE" && w.published).length;
  const unpriced = works.filter((w) => w.priceCents == null && w.status === "AVAILABLE").length;

  return (
    <>
      <h1>Artworks</h1>
      <div className="tiles">
        <div className="tile"><b>{available}</b><span>For sale</span></div>
        <div className="tile"><b>{works.filter((w) => w.status === "SOLD").length}</b><span>Sold</span></div>
        <div className="tile"><b>{formatPrice(paid._sum.amountCents ?? 0)}</b><span>Revenue, {paid._count} orders</span></div>
        <div className="tile"><b>{unread}</b><span>Unread messages</span></div>
      </div>
      {unpriced > 0 && (
        <p className="notice" style={{ marginBottom: 20 }}>
          {unpriced} {unpriced === 1 ? "piece has" : "pieces have"} no price yet, so buyers see “Price on request” and can only send you a
          message. Click a title to set a price, size and year.
        </p>
      )}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th></th><th>No.</th><th>Title</th><th>Price</th><th>Status</th><th>On site</th><th>Featured</th>
            </tr>
          </thead>
          <tbody>
            {works.map((w) => (
              <tr key={w.id}>
                <td>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={w.imageUrl} alt="" />
                </td>
                <td className="num">{catalogNo(w.number)}</td>
                <td><Link href={`/admin/art/${w.id}`} style={{ fontStyle: "italic" }}>{w.title}</Link><br /><small style={{ color: "var(--graphite)" }}>{w.medium}</small></td>
                <td className="num">{w.priceCents == null ? <span className="pill muted">Not set</span> : formatPrice(w.priceCents)}</td>
                <td>
                  <Toggle id={w.id} field="status">
                    {w.status === "SOLD" ? <span className="pill sold">Sold</span> : isOnHold(w) ? <span className="pill muted">In checkout</span> : <span className="pill ok">Available</span>}
                  </Toggle>
                </td>
                <td><Toggle id={w.id} field="published">{w.published ? "Shown" : "Hidden"}</Toggle></td>
                <td><Toggle id={w.id} field="featured">{w.featured ? "★ Home page" : "—"}</Toggle></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mono" style={{ color: "var(--graphite)", marginTop: 12 }}>Tip: click a status, “Shown” or “★” to switch it.</p>
    </>
  );
}
