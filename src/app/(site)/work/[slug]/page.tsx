import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { catalogNo, formatPrice } from "@/lib/format";
import { saleState } from "@/lib/availability";
import { AddToCart } from "@/components/AddToCart";

async function getArt(slug: string) {
  return prisma.artwork.findFirst({ where: { slug, published: true } });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const art = await getArt(params.slug);
  if (!art) return {};
  return {
    title: art.title,
    description: `${art.title}. ${art.medium}${art.size ? `, ${art.size}` : ""}. Original artwork.`,
    openGraph: { images: [{ url: art.imageUrl, width: art.imageWidth, height: art.imageHeight }] },
  };
}

export default async function ArtPage({ params }: { params: { slug: string } }) {
  const art = await getArt(params.slug);
  if (!art) notFound();
  const state = saleState(art);

  return (
    <div className="wrap">
      <p className="mono" style={{ marginTop: 24 }}>
        <Link href="/work">← All work</Link>
      </p>
      <article className="detail">
        <div className="frame">
          <Image
            src={art.imageUrl}
            alt={`${art.title}, ${art.medium.toLowerCase()}`}
            width={art.imageWidth}
            height={art.imageHeight}
            sizes="(max-width: 820px) 100vw, 60vw"
            priority
          />
        </div>
        <aside>
          <span className="mono" style={{ color: "var(--graphite)" }}>{catalogNo(art.number)}</span>
          <h1>{art.title}</h1>
          <dl className="facts">
            <div><dt>Medium</dt><dd>{art.medium}</dd></div>
            {art.size && <div><dt>Size</dt><dd>{art.size}</dd></div>}
            {art.year && <div><dt>Year</dt><dd>{art.year}</dd></div>}
            <div><dt>Edition</dt><dd>Original, one of one</dd></div>
          </dl>

          {state === "sold" && (
            <p className="bigprice"><span className="reddot" aria-hidden="true" />Sold</p>
          )}
          {state === "on-hold" && (
            <p className="bigprice hold">On hold. Someone is checking out with this piece. Try again in 30 minutes.</p>
          )}
          {state === "available" && (
            <>
              <p className="bigprice">{formatPrice(art.priceCents)}</p>
              <AddToCart item={{ id: art.id, slug: art.slug, title: art.title, priceCents: art.priceCents!, imageUrl: art.imageUrl }} />
            </>
          )}
          {state === "inquire" && (
            <>
              <p className="bigprice">Price on request</p>
              <Link className="btn block" href={`/contact?art=${art.slug}`}>Ask about this piece</Link>
            </>
          )}
          {state !== "inquire" && (
            <p style={{ marginTop: 14 }}>
              <Link className="linkish" href={`/contact?art=${art.slug}`}>Questions? Ask about this piece</Link>
            </p>
          )}

          {art.description && <p className="desc" style={{ marginTop: 28 }}>{art.description}</p>}
        </aside>
      </article>
    </div>
  );
}
