import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NavBar } from "@/components/navbar";
import { searchMovies, searchPeople, tmdbImage } from "@/lib/tmdb";
import { Film, User, Search } from "lucide-react";
import { SearchInput } from "./search-input";

type Locale = "fr" | "en";

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { locale } = await params;
  const { q, type } = await searchParams;
  const l = (locale as Locale) ?? "fr";
  const t = await getTranslations({ locale: l, namespace: "search" });

  let filmResults = null;
  let peopleResults = null;

  if (q) {
    try {
      [filmResults, peopleResults] = await Promise.all([
        searchMovies(q, l),
        searchPeople(q, l),
      ]);
    } catch {
      // TMDB error
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar locale={l} />

      <main className="flex-1 pt-24 pb-16 px-6 max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6">{t("searchTitle")}</h1>

        <SearchInput placeholder={t("placeholder")} />

        {q && (
          <div className="mt-8 space-y-10">
            {/* Films */}
            {filmResults && filmResults.results.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Film className="w-4 h-4 text-primary" />
                  <h2 className="font-semibold">{t("films")}</h2>
                  <Badge variant="outline" className="text-xs">{filmResults.total_results}</Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {filmResults.results.slice(0, 12).map((film) => {
                    const poster = tmdbImage(film.poster_path, "w342");
                    return (
                      <Link key={film.id} href={`/${l}/film/${film.id}`}>
                        <Card className="border-border/50 bg-card card-hover cursor-pointer overflow-hidden group h-full">
                          <div className="relative h-44">
                            {poster ? (
                              <Image src={poster} alt={film.title} fill className="object-cover" sizes="200px" />
                            ) : (
                              <div className="h-full flex items-center justify-center bg-muted">
                                <Film className="w-8 h-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <CardContent className="p-2">
                            <p className="font-medium text-xs leading-tight group-hover:text-primary transition-colors line-clamp-2">
                              {film.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {film.release_date?.slice(0, 4)}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* People */}
            {peopleResults && peopleResults.results.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-4 h-4 text-primary" />
                  <h2 className="font-semibold">{t("people")}</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {peopleResults.results.slice(0, 12).map((person) => {
                    const photo = tmdbImage(person.profile_path, "w185");
                    return (
                      <Link key={person.id} href={`/${l}/actor/${person.id}`}>
                        <Card className="border-border/50 bg-card card-hover cursor-pointer overflow-hidden group">
                          <div className="relative h-36">
                            {photo ? (
                              <Image src={photo} alt={person.name} fill className="object-cover object-top" sizes="150px" />
                            ) : (
                              <div className="h-full flex items-center justify-center bg-muted">
                                <User className="w-8 h-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <CardContent className="p-2 text-center">
                            <p className="font-medium text-xs leading-tight group-hover:text-primary transition-colors line-clamp-1">{person.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{person.known_for_department}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {filmResults?.results.length === 0 && peopleResults?.results.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>{t("noResults")} &quot;{q}&quot;</p>
              </div>
            )}
          </div>
        )}

        {!q && (
          <div className="text-center py-24 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg">{t("placeholder")}</p>
          </div>
        )}
      </main>
    </div>
  );
}
