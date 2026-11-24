import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { ContactForm } from "./ContactForm";

export const metadata = { title: "Contact" };

export default async function ContactPage({ searchParams }: { searchParams: { art?: string } }) {
  const s = await getSettings();
  const art = searchParams.art
    ? await prisma.artwork.findFirst({ where: { slug: searchParams.art, published: true }, select: { id: true, title: true } })
    : null;
  return (
    <section className="wrap page">
      <h1>Contact</h1>
      <p className="prose" style={{ marginBottom: 28 }}>
        Questions about a piece, commissions, or shipping: send a note.
        {s.contactEmail ? ` Or email ${s.contactEmail}.` : ""}
      </p>
      <ContactForm artworkId={art?.id} artTitle={art?.title} />
    </section>
  );
}
