import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { NavBar } from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPerson, getPersonMovieCredits, tmdbImage } from "@/lib/tmdb";
import { ArrowLeft, Calendar, MapPin, Film } from "lucide-react";

type Locale = "fr" | "en";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  try {
    const person = await getPerson(Number(id), locale as Locale);
    return { title: `${person.name} — ReClap` };
  } catch {
    return { title: "Acteur — ReClap" };
  }
}

export default async function ActorPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const l = (locale as Locale) ?? "fr";
  const personId = Number(id);
  if (isNaN(personId)) notFound();

  let person, credits;
  try {
    [person, credits] = await Promise.all([
      getPerson(personId, l),
      getPersonMovieCredits(personId, l),
    ]);
  } catch {
    notFound();
  }

  const t = await getTranslations({ locale: l, namespace: "actor" });
  const photo = tmdbImage(person.profile_path, "w500");

  const sortedCast = [...credits.cast]
    .filter((m) => m.release_date)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 20);

  const isDirector = credits.crew.some((c) => c.job === "Director");
  const directedFilms = credits.crew
    .filter((c) => c.job === "Director" && c.release_date)
    .sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime())
    .slice(0, 10);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar locale={l} />

      <main className="flex-1 pt-24 pb-16 px-6 max-w-7xl mx-auto w-full">
        <Link href={`/${l}/search`}>
          <Button variant="ghost" size="sm" className="gap-2 mb-6">
            <ArrowLeft className="w-4 h-4" /> {t("backToFilm")}
          </Button>
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="shrink-0">
            <div className="w-40 md:w-48 aspect-[2/3] relative rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              {photo ? (
                <Image src={photo} alt={person.name} fill className="object-cover object-top" sizes="192px" priority />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-4xl font-bold text-muted-foreground">
                  {person.name[0]}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 flex-1">
            <div>
              <h1 className="text-4xl font-bold mb-2">{person.name}</h1>
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
                {person.known_for_department}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {person.birthday && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{t("born")} {new Date(person.birthday).toLocaleDateString(l === "fr" ? "fr-FR" : "en-US", { day: "numeric", month: "long", year: "numeric" })}</span>
                  {person.deathday && <span>— {t("died")} {new Date(person.deathday).toLocaleDateString(l === "fr" ? "fr-FR" : "en-US", { day: "numeric", month: "long", year: "numeric" })}</span>}
                </div>
              )}
              {person.place_of_birth && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{person.place_of_birth}</span>
                </div>
              )}
            </div>

            {person.biography ? (
              <div className="max-w-2xl">
                <h2 className="font-semibold mb-2">{t("biography")}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-6">{person.biography}</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">{t("noBio")}</p>
            )}
          </div>
        </div>

        {/* Filmography as actor */}
        {sortedCast.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-5">
              <Film className="w-4 h-4 text-primary" />
              <h2 className="text-xl font-bold">{t("filmography")}</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {sortedCast.map((film) => {
                const poster = tmdbImage(film.poster_path, "w342");
                return (
                  <Link key={`${film.id}-${film.character}`} href={`/${l}/film/${film.id}`}>
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
                        <p className="font-medium text-xs leading-tight group-hover:text-primary transition-colors line-clamp-2">{film.title}</p>
                        {film.character && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{t("asCharacter")} {film.character}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">{film.release_date?.slice(0, 4)}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* As director */}
        {isDirector && directedFilms.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-5">{t("knownFor")} — Réalisateur</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {directedFilms.map((film) => {
                const poster = tmdbImage(film.poster_path, "w342");
                return (
                  <Link key={film.id} href={`/${l}/film/${film.id}`}>
                    <Card className="border-border/50 bg-card card-hover cursor-pointer overflow-hidden group">
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
                        <p className="font-medium text-xs leading-tight group-hover:text-primary transition-colors line-clamp-2">{film.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{film.release_date?.slice(0, 4)}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
