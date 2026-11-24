import type { Metadata } from "next";
import { Big_Shoulders_Display, Newsreader, IBM_Plex_Mono } from "next/font/google";
import { CartProvider } from "@/components/cart";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/stripe";
import "./globals.css";

const display = Big_Shoulders_Display({ subsets: ["latin"], weight: ["800", "900"], variable: "--f-display" });
const label = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], variable: "--f-label" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--f-mono" });

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: `${s.siteName} | ${s.tagline}`, template: `%s | ${s.siteName}` },
    description: `${s.tagline} by ${s.artistName}.`,
    openGraph: { siteName: s.siteName, type: "website" },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${label.variable} ${mono.variable}`}>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
