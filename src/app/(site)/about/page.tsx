import Link from "next/link";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "About" };

export default async function AboutPage() {
  const s = await getSettings();
  return (
    <section className="wrap page">
      <h1>{s.artistName}</h1>
      <div className="prose">
        {s.bio ||
          "Painter and draughtsman working in graphite, colored pencil, acrylic and mixed media. Every piece on this site is an original, one of one."}
      </div>
      <p style={{ marginTop: 32 }}>
        <Link className="btn" href="/work">See the work</Link>
      </p>
    </section>
  );
}
