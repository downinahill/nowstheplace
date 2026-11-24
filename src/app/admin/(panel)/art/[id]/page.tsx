import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { catalogNo } from "@/lib/format";
import { ArtworkForm } from "@/components/ArtworkForm";
import { deleteArtwork } from "../../../actions";

export default async function EditArt({ params }: { params: { id: string } }) {
  const art = await prisma.artwork.findUnique({ where: { id: params.id }, include: { _count: { select: { orderItems: true } } } });
  if (!art) notFound();
  return (
    <>
      <h1>{catalogNo(art.number)} · {art.title}</h1>
      <p className="mono" style={{ marginTop: -8, marginBottom: 24 }}>
        <Link href={`/work/${art.slug}`} target="_blank">View on site ↗</Link>
      </p>
      <ArtworkForm art={art} />
      <form action={deleteArtwork} style={{ marginTop: 48, borderTop: "1px solid var(--rule)", paddingTop: 20 }}>
        <input type="hidden" name="id" value={art.id} />
        <button className="btn danger small">{art._count.orderItems ? "Hide from site (has orders)" : "Delete this piece"}</button>
      </form>
    </>
  );
}
