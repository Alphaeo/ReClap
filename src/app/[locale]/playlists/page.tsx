import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import { NavBar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { tmdbImage } from "@/lib/tmdb";
import { Film } from "lucide-react";

type Locale = "fr" | "en";

const PLAYLISTS = [
  {
    slug: "debut",
    emoji: "🎬",
    fr: { title: "Pour débuter le cinéma", description: "Les films essentiels pour découvrir le 7ème art, accessibles à tous." },
    en: { title: "Starting Cinema", description: "Essential films to discover the 7th art, accessible to everyone." },
    color: "from-red-900/60",
    filmIds: [13, 550, 278, 238, 680, 424, 27205, 155, 122, 769],
  },
  {
    slug: "palme-dor",
    emoji: "🌿",
    fr: { title: "Palmes d'or incontournables", description: "Les grands vainqueurs de Cannes à travers les décennies." },
    en: { title: "Must-see Palme d'Or", description: "The great winners of Cannes across the decades." },
    color: "from-yellow-900/60",
    filmIds: [194, 17473, 289, 637, 11216, 9806, 429, 562, 14, 4476],
  },
  {
    slug: "scifi-essentiel",
    emoji: "🚀",
    fr: { title: "Sci-Fi incontournable", description: "De Kubrick à Villeneuve, le meilleur de la science-fiction." },
    en: { title: "Essential Sci-Fi", description: "From Kubrick to Villeneuve, the best of science fiction." },
    color: "from-blue-900/60",
    filmIds: [62, 78, 329865, 157336, 27205, 693134, 420, 72105, 11, 1726],
  },
  {
    slug: "cinema-coreen",
    emoji: "🇰🇷",
    fr: { title: "Cinéma coréen", description: "La nouvelle vague coréenne qui a conquis le monde entier." },
    en: { title: "Korean Cinema", description: "The Korean new wave that conquered the entire world." },
    color: "from-green-900/60",
    filmIds: [496243, 670292, 51739, 77338, 568554, 6479, 97061, 45612, 399826, 44214],
  },
  {
    slug: "nuits-horreur",
    emoji: "👻",
    fr: { title: "Nuits d'horreur", description: "Pour ceux qui aiment avoir peur. À regarder toutes lumières éteintes." },
    en: { title: "Horror Nights", description: "For those who like to be scared. Watch with all lights off." },
    color: "from-purple-900/60",
    filmIds: [694, 539, 745, 218, 1091, 901, 23483, 2454, 558, 185],
  },
  {
    slug: "classiques-hollywoodiens",
    emoji: "⭐",
    fr: { title: "Classiques hollywoodiens", description: "L'âge d'or d'Hollywood, des films qui ont tout inventé." },
    en: { title: "Hollywood Classics", description: "Hollywood's golden age — films that invented everything." },
    color: "from-amber-900/60",
    filmIds: [289, 2769, 11202, 1572, 947, 947, 220, 872, 348, 807],
  },
  {
    slug: "anime-cultes",
    emoji: "🎌",
    fr: { title: "Animés cultes", description: "Studio Ghibli, Kon, Satoshi — l'animation japonaise au sommet." },
    en: { title: "Cult Anime", description: "Studio Ghibli, Kon, Satoshi — Japanese animation at its peak." },
    color: "from-pink-900/60",
    filmIds: [129, 4935, 149870, 12477, 37854, 37779, 10515, 17483, 15260, 8392],
  },
  {
    slug: "documentaires",
    emoji: "🎥",
    fr: { title: "Documentaires essentiels", description: "Des films qui changent ta vision du monde. Vraie vie, vraies émotions." },
    en: { title: "Essential Documentaries", description: "Films that change your worldview. Real life, real emotions." },
    color: "from-stone-900/60",
    filmIds: [49018, 72976, 244786, 20001, 254875, 82507, 72879, 47493, 371645, 220646],
  },
];

async function getPlaylistPosters(filmIds: number[]): Promise<string[]> {
  try {
    const results = await Promise.all(
      filmIds.slice(0, 4).map(async (id) => {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?language=en-US`, {
          headers: { Authorization: `Bearer ${process.env.TMDB_API_READ_TOKEN}` },
          next: { revalidate: 86400 },
        });
        if (!res.ok) return null;
        const data = await res.json();
        return tmdbImage(data.poster_path, "w342");
      })
    );
    return results.filter(Boolean) as string[];
  } catch {
    return [];
  }
}

export default async function PlaylistsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (locale as Locale) ?? "fr";

  const playlistsWithPosters = await Promise.all(
    PLAYLISTS.map(async (p) => ({ ...p, posters: await getPlaylistPosters(p.filmIds) }))
  );

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar locale={l} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-24 pb-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">
            {l === "fr" ? "Playlists cinéma" : "Cinema playlists"}
          </h1>
          <p className="text-muted-foreground">
            {l === "fr"
              ? "Des sélections curatoriales pour tous les goûts et toutes les humeurs."
              : "Curated selections for every taste and every mood."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {playlistsWithPosters.map((playlist) => {
            const info = l === "fr" ? playlist.fr : playlist.en;
            return (
              <Link key={playlist.slug} href={`/${l}/playlists/${playlist.slug}`}>
                <Card className="border-border/50 bg-card card-hover cursor-pointer overflow-hidden group h-full">
                  {/* Poster collage */}
                  <div className={`h-40 relative bg-gradient-to-br ${playlist.color} to-card overflow-hidden`}>
                    {playlist.posters.length >= 4 ? (
                      <div className="grid grid-cols-2 gap-0.5 h-full">
                        {playlist.posters.slice(0, 4).map((poster, i) => (
                          <div key={i} className="relative overflow-hidden">
                            <Image src={poster} alt="" fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" sizes="100px" />
                          </div>
                        ))}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        {playlist.emoji}
                      </div>
                    )}
                    <div className="absolute top-2 left-2 text-2xl">{playlist.emoji}</div>
                    <div className="absolute bottom-2 right-2">
                      <Badge className="bg-black/60 text-white border-0 text-xs backdrop-blur-sm">
                        {playlist.filmIds.length} films
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors leading-tight">{info.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{info.description}</p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
