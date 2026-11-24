import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { Piece } from "@/components/Piece";

export default async function Home() {
  const s = await getSettings();
  const [featured, total, available] = await Promise.all([
    prisma.artwork.findMany({ where: { published: true, featured: true }, orderBy: { number: "desc" }, take: 6 }),
    prisma.artwork.count({ where: { published: true } }),
    prisma.artwork.count({ where: { published: true, status: "AVAILABLE" } }),
  ]);
  const works = featured.length
    ? featured
    : await prisma.artwork.findMany({ where: { published: true }, orderBy: { number: "desc" }, take: 6 });

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <h1>
            {s.siteName}
            <span className="dot">.</span>
          </h1>
          <div className="hero-meta">
            <span>
              {s.tagline} by {s.artistName}
            </span>
            <span>
              {total} works · {available} available
            </span>
          </div>
        </div>
      </section>
      <section className="wrap">
        <div className="section-head">
          <h2>On the wall</h2>
          <Link className="mono" href="/work">
            All work →
          </Link>
        </div>
        <div className="grid">
          {works.map((a, i) => (
            <Piece key={a.id} art={a} priority={i < 3} />
          ))}
        </div>
      </section>
    </>
  );
}
