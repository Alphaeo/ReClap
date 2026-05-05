import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NavBar } from "@/components/navbar";
import { searchMovies, searchPeople, searchTV, discoverMedia, TMDB_GENRES_MOVIE, TMDB_COUNTRIES, tmdbImage } from "@/lib/tmdb";
import { Film, User, Search } from "lucide-react";
import { SearchInput } from "./search-input";
import { SearchFilters } from "./search-filters";

type Locale = "fr" | "en";
type MediaType = "movie" | "tv" | "anime" | "people";

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; type?: string; genre?: string; country?: string; year?: string; sort?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const l = (locale as Locale) ?? "fr";
  const t = await getTranslations({ locale: l, namespace: "search" });

  const q = sp.q ?? "";
  const type = (sp.type as MediaType) ?? "movie";
  const genre = sp.genre ?? "";
  const country = sp.country ?? "";
  const year = sp.year ?? "";
  const sort = sp.sort ?? "popularity.desc";

  let results: { id: number; title: string; poster_path: string | null; year: string; vote_average: number }[] = [];
  let totalResults = 0;

  try {
    if (q) {
      if (type === "people") {
        const r = await searchPeople(q, l);
        results = r.results.map((p) => ({ id: p.id, title: p.name, poster_path: p.profile_path, year: p.known_for_department, vote_average: 0 }));
        totalResults = r.results.length;
      } else if (type === "tv" || type === "anime") {
        const r = await searchTV(q, l);
        results = r.results.map((s) => ({ id: s.id, title: s.name, poster_path: s.poster_path, year: s.first_air_date?.slice(0, 4) ?? "", vote_average: s.vote_average }));
        totalResults = r.total_results;
      } else {
        const r = await searchMovies(q, l);
        results = r.results.map((m) => ({ id: m.id, title: m.title, poster_path: m.poster_path, year: m.release_date?.slice(0, 4) ?? "", vote_average: m.vote_average }));
        totalResults = r.total_results;
      }
    } else if (genre || country || year || type !== "people") {
      const discoverType = type === "anime" ? "tv" : type === "people" ? "movie" : type;
      const discoverGenre = type === "anime" ? "16" : genre;
      const discoverCountry = type === "anime" ? "JP" : country;
      const r = await discoverMedia({ type: discoverType, genreId: discoverGenre || undefined, originCountry: discoverCountry || undefined, year: year || undefined, sortBy: sort }, l);
      results = r.results.map((m) => ({
        id: m.id,
        title: (m as { title?: string; name?: string }).title ?? (m as { name?: string }).name ?? "",
        poster_path: m.poster_path,
        year: ((m as { release_date?: string }).release_date ?? (m as { first_air_date?: string }).first_air_date ?? "").slice(0, 4),
        vote_average: m.vote_average,
      }));
      totalResults = r.total_results;
    }
  } catch { /* TMDB not configured */ }

  const genres = TMDB_GENRES_MOVIE;
  const countries = TMDB_COUNTRIES;

  const typeLabels: Record<MediaType, string> = {
    movie: l === "fr" ? "Films" : "Films",
    tv: l === "fr" ? "Séries" : "Series",
    anime: "Anime",
    people: l === "fr" ? "Personnes" : "People",
  };

  const sortOptions = [
    { value: "popularity.desc", label: l === "fr" ? "Popularité" : "Popularity" },
    { value: "vote_average.desc", label: l === "fr" ? "Mieux notés" : "Top rated" },
    { value: "release_date.desc", label: l === "fr" ? "Plus récents" : "Newest" },
    { value: "release_date.asc", label: l === "fr" ? "Plus anciens" : "Oldest" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar locale={l} />
      <main className="flex-1 pt-24 pb-16 px-6 max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <Suspense fallback={<div className="h-11 bg-card/50 animate-pulse w-full max-w-xl" />}>
            <SearchInput placeholder={t("placeholder")} />
          </Suspense>
        </div>

        {/* Type tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {(["movie", "tv", "anime", "people"] as MediaType[]).map((t) => {
            const params = new URLSearchParams(sp as Record<string, string>);
            params.set("type", t);
            return (
              <Link key={t} href={`/${l}/search?${params.toString()}`}>
                <Badge variant={type === t ? "default" : "outline"}
                  className={`cursor-pointer whitespace-nowrap ${type === t ? "bg-primary text-primary-foreground" : "border-border/50 hover:border-primary/50"}`}>
                  {typeLabels[t]}
                </Badge>
              </Link>
            );
          })}
        </div>

        <div className="flex gap-6">
          {/* Filters sidebar */}
          {type !== "people" && (
            <SearchFilters
              locale={l}
              genres={genres}
              countries={countries}
              sortOptions={sortOptions}
              currentGenre={genre}
              currentCountry={country}
              currentYear={year}
              currentSort={sort}
              currentType={type}
              searchParams={sp as Record<string, string>}
            />
          )}

          {/* Results */}
          <div className="flex-1">
            {totalResults > 0 && (
              <p className="text-sm text-muted-foreground mb-4">
                {totalResults.toLocaleString()} {t("results")}{q ? ` pour "${q}"` : ""}
              </p>
            )}

            {results.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {results.map((item) => {
                  const poster = tmdbImage(item.poster_path, "w342");
                  const href = type === "people" ? `/${l}/actor/${item.id}` : `/${l}/film/${item.id}`;
                  return (
                    <Link key={item.id} href={href}>
                      <Card className="border-border/50 bg-card card-hover cursor-pointer overflow-hidden group h-full">
                        <div className="relative h-48">
                          {poster ? (
                            <Image src={poster} alt={item.title} fill className="object-cover object-top" sizes="200px" />
                          ) : (
                            <div className="h-full flex items-center justify-center bg-muted">
                              {type === "people" ? <User className="w-8 h-8 text-muted-foreground" /> : <Film className="w-8 h-8 text-muted-foreground" />}
                            </div>
                          )}
                          {item.vote_average > 0 && (
                            <div className="absolute top-1.5 left-1.5 bg-black/70 rounded px-1.5 py-0.5 text-xs text-white backdrop-blur-sm">
                              ★ {item.vote_average.toFixed(1)}
                            </div>
                          )}
                        </div>
                        <CardContent className="p-2">
                          <p className="font-medium text-xs leading-tight group-hover:text-primary transition-colors line-clamp-2">{item.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.year}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-24 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg">{q ? `${t("noResults")} "${q}"` : t("placeholder")}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
