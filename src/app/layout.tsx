import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://re-clap.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: { default: "ReClap — Ton cinéma, réinventé", template: "%s — ReClap" },
  description: "Tracker de films moderne et rapide. Note, découvre, partage et explore le cinéma comme jamais auparavant.",
  keywords: ["cinéma", "films", "tracker", "letterboxd", "critique", "avis", "watchlist"],
  authors: [{ name: "ReClap" }],
  creator: "ReClap",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    alternateLocale: "en_US",
    url: BASE,
    siteName: "ReClap",
    title: "ReClap — Ton cinéma, réinventé",
    description: "Tracker de films moderne. Note, découvre et partage ta passion du cinéma.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ReClap" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ReClap — Ton cinéma, réinventé",
    description: "Tracker de films moderne. Note, découvre et partage ta passion du cinéma.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  icons: { icon: "/favicon.ico", apple: "/apple-icon.png" },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
