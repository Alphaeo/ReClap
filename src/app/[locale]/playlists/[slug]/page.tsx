import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { NavBar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { tmdbImage } from "@/lib/tmdb";
import { ArrowLeft, Film, Star } from "lucide-react";

type Locale = "fr" | "en";

const PLAYLISTS: Record<string, {
  emoji: string;
  fr: { title: string; description: string };
  en: { title: string; description: string };
  filmIds: number[];
}> = {
  debut: {
    emoji: "🎬",
    fr: { title: "Pour débuter le cinéma", description: "Les films essentiels pour découvrir le 7ème art, accessibles à tous." },
    en: { title: "Starting Cinema", description: "Essential films to discover the 7th art, accessible to everyone." },
    filmIds: [13, 550, 278, 238, 680, 424, 27205, 155, 122, 769],
  },
  "palme-dor": {
    emoji: "🌿",
    fr: { title: "Palmes d'or incontournables", description: "Les grands vainqueurs de Cannes à travers les décennies." },
    en: { title: "Must-see Palme d'Or", description: "The great winners of Cannes across the decades." },
    filmIds: [194, 17473, 289, 637, 11216, 9806, 429, 562, 14, 4476],
  },
  "scifi-essentiel": {
    emoji: "🚀",
    fr: { title: "Sci-Fi incontournable", description: "De Kubrick à Villeneuve, le meilleur de la science-fiction." },
    en: { title: "Essential Sci-Fi", description: "From Kubrick to Villeneuve, the best of science fiction." },
    filmIds: [62, 78, 329865, 157336, 27205, 693134, 420, 72105, 11, 1726],
  },
  "cinema-coreen": {
    emoji: "🇰🇷",
    fr: { title: "Cinéma coréen", description: "La nouvelle vague coréenne qui a conquis le monde entier." },
    en: { title: "Korean Cinema", description: "The Korean new wave that conquered the entire world." },
    filmIds: [496243, 670292, 51739, 77338, 568554, 6479, 97061, 45612, 399826, 44214],
  },
  "nuits-horreur": {
    emoji: "👻",
    fr: { title: "Nuits d'horreur", description: "Pour ceux qui aiment avoir peur. À regarder toutes lumières éteintes." },
    en: { title: "Horror Nights", description: "For those who like to be scared. Watch with all lights off." },
    filmIds: [694, 539, 745, 218, 1091, 901, 23483, 2454, 558, 185],
  },
  "classiques-hollywoodiens": {
    emoji: "⭐",
    fr: { title: "Classiques hollywoodiens", description: "L'âge d'or d'Hollywood, des films qui ont tout inventé." },
    en: { title: "Hollywood Classics", description: "Hollywood's golden age — films that invented everything." },
    filmIds: [289, 2769, 11202, 1572, 947, 220, 872, 348, 807, 637],
  },
  "anime-cultes": {
    emoji: "🎌",
    fr: { title: "Animés cultes", description: "Studio Ghibli, Kon, Satoshi — l'animation japonaise au sommet." },
    en: { title: "Cult Anime", description: "Studio Ghibli, Kon, Satoshi — Japanese animation at its peak." },
    filmIds: [129, 4935, 149870, 12477, 37854, 37779, 10515, 17483, 15260, 8392],
  },
  documentaires: {
    emoji: "🎥",
    fr: { title: "Documentaires essentiels", description: "Des films qui changent ta vision du monde." },
    en: { title: "Essential Documentaries", description: "Films that change your worldview." },
    filmIds: [49018, 72976, 244786, 20001, 254875, 82507, 72879, 47493, 371645, 220646],
  },
};

async function getFilm(id: number, lang: string) {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?language=${lang}`, {
      headers: { Authorization: `Bearer ${process.env.TMDB_API_READ_TOKEN}` },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export default async function PlaylistDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const l = (locale as Locale) ?? "fr";
  const playlist = PLAYLISTS[slug];
  if (!playlist) notFound();

  const info = l === "fr" ? playlist.fr : playlist.en;
  const lang = l === "fr" ? "fr-FR" : "en-US";

  const films = (await Promise.all(playlist.filmIds.map((id) => getFilm(id, lang)))).filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar locale={l} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-24 pb-12">
        <Link href={`/${l}/playlists`}>
          <Button variant="ghost" size="sm" className="gap-2 mb-6">
            <ArrowLeft className="w-4 h-4" /> {l === "fr" ? "Playlists" : "Playlists"}
          </Button>
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{playlist.emoji}</span>
            <h1 className="text-3xl font-bold">{info.title}</h1>
          </div>
          <p className="text-muted-foreground max-w-xl">{info.description}</p>
          <Badge variant="outline" className="mt-3 border-primary/30 text-primary">{films.length} films</Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {films.map((film: { id: number; title: string; poster_path: string | null; release_date: string; vote_average: number; overview: string }, i) => {
            const poster = tmdbImage(film.poster_path, "w342");
            return (
              <Link key={film.id} href={`/${l}/film/${film.id}`}>
                <div className="group relative">
                  <div className="absolute -top-2 -left-2 z-10 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shadow-lg">
                    {i + 1}
                  </div>
                  <Card className="border-border/50 bg-card card-hover cursor-pointer overflow-hidden h-full">
                    <div className="relative h-52">
                      {poster ? (
                        <Image src={poster} alt={film.title} fill className="object-cover" sizes="200px" />
                      ) : (
                        <div className="h-full flex items-center justify-center bg-muted">
                          <Film className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-1.5 right-1.5 bg-black/70 rounded px-1.5 py-0.5 text-xs text-white flex items-center gap-0.5 backdrop-blur-sm">
                        <Star className="w-2.5 h-2.5 fill-primary text-primary" />
                        {film.vote_average.toFixed(1)}
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <p className="font-medium text-xs leading-tight group-hover:text-primary transition-colors line-clamp-2">{film.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{film.release_date?.slice(0, 4)}</p>
                    </CardContent>
                  </Card>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
