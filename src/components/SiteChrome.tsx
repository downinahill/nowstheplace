import Link from "next/link";
import { CartCount } from "./cart";
import { getSettings } from "@/lib/settings";

export async function SiteHeader() {
  const s = await getSettings();
  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" className="wordmark">
          {s.siteName}
          <span className="dot">.</span>
        </Link>
        <nav className="nav" aria-label="Main">
          <Link href="/work">Work</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/cart">
            <CartCount />
          </Link>
        </nav>
      </div>
    </header>
  );
}

export async function SiteFooter() {
  const s = await getSettings();
  return (
    <footer className="site-footer">
      <div className="wrap mono">
        <span>
          © {new Date().getFullYear()} {s.artistName}. All works are originals.
        </span>
        <span style={{ display: "flex", gap: 18 }}>
          {s.instagram && (
            <a href={`https://instagram.com/${s.instagram.replace(/^@/, "")}`}>Instagram</a>
          )}
          {s.contactEmail && <a href={`mailto:${s.contactEmail}`}>{s.contactEmail}</a>}
        </span>
      </div>
    </footer>
  );
}
