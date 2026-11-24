import Image from "next/image";
import Link from "next/link";
import type { Artwork } from "@prisma/client";
import { catalogNo, formatPrice } from "@/lib/format";
import { saleState } from "@/lib/availability";

export function PriceTag({ art }: { art: Pick<Artwork, "status" | "priceCents" | "reservedUntil"> }) {
  const state = saleState(art);
  if (state === "sold")
    return (
      <span className="price">
        <span className="reddot" aria-hidden="true" />
        Sold
      </span>
    );
  if (state === "on-hold") return <span className="price hold">On hold</span>;
  return <span className="price">{formatPrice(art.priceCents)}</span>;
}

export function Piece({ art, priority = false }: { art: Artwork; priority?: boolean }) {
  return (
    <Link href={`/work/${art.slug}`} className="piece">
      <div className="frame">
        <Image
          src={art.imageUrl}
          alt={`${art.title}, ${art.medium.toLowerCase()} by the artist`}
          width={art.imageWidth}
          height={art.imageHeight}
          sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 420px"
          priority={priority}
        />
      </div>
      <div className="label">
        <span className="no">{catalogNo(art.number)}</span>
        <PriceTag art={art} />
        <span className="title">{art.title}</span>
        <span className="medium">
          {art.medium}
          {art.size ? `, ${art.size}` : ""}
        </span>
      </div>
    </Link>
  );
}
