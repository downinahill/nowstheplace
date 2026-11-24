import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logout } from "../actions";

export const metadata = { title: "Dashboard", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const unread = await prisma.inquiry.count({ where: { read: false } });
  return (
    <div className="admin">
      <header className="admin-bar">
        <div className="wrap">
          <nav aria-label="Dashboard">
            <Link href="/admin">Artworks</Link>
            <Link href="/admin/art/new">+ Add piece</Link>
            <Link href="/admin/orders">Orders</Link>
            <Link href="/admin/inquiries">Messages{unread ? ` (${unread})` : ""}</Link>
            <Link href="/admin/settings">Site settings</Link>
          </nav>
          <nav>
            <Link href="/" target="_blank">View site ↗</Link>
            <form action={logout}>
              <button className="linkish" style={{ color: "var(--wall)" }}>Log out</button>
            </form>
          </nav>
        </div>
      </header>
      <main className="wrap" style={{ paddingBottom: 80 }}>{children}</main>
    </div>
  );
}
