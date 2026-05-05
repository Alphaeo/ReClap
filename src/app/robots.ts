import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://re-clap.vercel.app";
  return {
    rules: [
      { userAgent: "*", allow: ["/fr/", "/en/"], disallow: ["/api/", "/fr/dashboard", "/en/dashboard", "/fr/pelicules", "/en/pelicules", "/fr/import", "/en/import"] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
