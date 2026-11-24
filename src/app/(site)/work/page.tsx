import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { Piece } from "@/components/Piece";

export const metadata = { title: "Work" };

const FILTERS = [
  { key: "all", label: "All" },
  { key: "available", label: "Available" },
  { key: "sold", label: "Sold" },
] as const;

export default async function WorkPage({ searchParams }: { searchParams: { show?: string } }) {
  const show = FILTERS.some((f) => f.key === searchParams.show) ? searchParams.show! : "all";
  const where: Prisma.ArtworkWhereInput = { published: true };
  if (show === "available") where.status = "AVAILABLE";
  if (show === "sold") where.status = "SOLD";
  const works = await prisma.artwork.findMany({ where, orderBy: { number: "desc" } });

  return (
    <section className="wrap">
      <div className="section-head">
        <h2>Work</h2>
        <nav className="filters" aria-label="Filter works">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              className="chip"
              href={f.key === "all" ? "/work" : `/work?show=${f.key}`}
              aria-current={show === f.key ? "page" : undefined}
            >
              {f.label}
            </Link>
          ))}
        </nav>
      </div>
      {works.length === 0 ? (
        <p className="mono" style={{ paddingBottom: 80 }}>Nothing here yet.</p>
      ) : (
        <div className="grid">
          {works.map((a, i) => (
            <Piece key={a.id} art={a} priority={i < 3} />
          ))}
        </div>
      )}
    </section>
  );
}
