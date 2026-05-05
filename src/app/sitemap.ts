import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://re-clap.vercel.app";
const LOCALES = ["fr", "en"];

const PLAYLIST_SLUGS = ["debut", "palme-dor", "scifi-essentiel", "cinema-coreen", "nuits-horreur", "classiques-hollywoodiens", "anime-cultes", "documentaires"];

const STATIC_PATHS = ["", "/search", "/playlists", "/learn"];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const path of STATIC_PATHS) {
      entries.push({ url: `${BASE}/${locale}${path}`, lastModified: new Date(), changeFrequency: "daily", priority: path === "" ? 1 : 0.8 });
    }
    for (const slug of PLAYLIST_SLUGS) {
      entries.push({ url: `${BASE}/${locale}/playlists/${slug}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 });
    }
  }

  return entries;
}
