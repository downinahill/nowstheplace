import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { deleteInquiry, toggleInquiryRead } from "../../actions";

export default async function Inquiries() {
  const qs = await prisma.inquiry.findMany({ orderBy: { createdAt: "desc" }, include: { artwork: { select: { title: true, slug: true } } } });
  return (
    <>
      <h1>Messages</h1>
      {qs.length === 0 && <p>No messages yet.</p>}
      <div style={{ display: "grid", gap: 14, maxWidth: 820 }}>
        {qs.map((q) => (
          <article key={q.id} className="tile" style={{ borderLeft: q.read ? undefined : "4px solid var(--dot)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <strong>{q.name} · <a href={`mailto:${q.email}?subject=${encodeURIComponent(q.artwork ? `Re: ${q.artwork.title}` : "Re: your message")}`}>{q.email}</a></strong>
              <span className="mono" style={{ color: "var(--graphite)" }}>{formatDate(q.createdAt)}</span>
            </div>
            {q.artwork && <p className="mono" style={{ margin: "6px 0" }}>About: <Link href={`/work/${q.artwork.slug}`} target="_blank">{q.artwork.title}</Link></p>}
            <p style={{ whiteSpace: "pre-line", margin: "8px 0 12px" }}>{q.message}</p>
            <div style={{ display: "flex", gap: 16 }}>
              <form action={toggleInquiryRead}><input type="hidden" name="id" value={q.id} /><button className="linkish">{q.read ? "Mark unread" : "Mark read"}</button></form>
              <form action={deleteInquiry}><input type="hidden" name="id" value={q.id} /><button className="linkish">Delete</button></form>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
