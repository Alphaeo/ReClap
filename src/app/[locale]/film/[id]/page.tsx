import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  getMovie, getMovieCredits, getMovieKeywords, getSimilarMovies,
  tmdbImage, formatRuntime, formatMoney, generateReclapFacts,
} from "@/lib/tmdb";
import { ArrowLeft, Star, Clock, Globe, Clapperboard, Lightbulb, Film, BookmarkPlus, Eye } from "lucide-react";

type Locale = "fr" | "en";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  try {
    const movie = await getMovie(Number(id), locale as Locale);
    return { title: `${movie.title} — ReClap`, description: movie.overview?.slice(0, 160) };
  } catch {
    return { title: "Film — ReClap" };
  }
}

function StarBar({ rating }: { rating: number }) {
  const pct = (rating / 10) * 100;
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => {
          const filled = s <= Math.floor(rating / 2);
          const half = !filled && s === Math.ceil(rating / 2);
          return (
            <Star
              key={s}
              className={`w-5 h-5 ${filled ? "text-primary fill-primary" : half ? "text-primary" : "text-white/20"}`}
            />
          );
        })}
      </div>
      <span className="text-2xl font-bold">{rating.toFixed(1)}</span>
      <span className="text-muted-foreground text-sm">/10</span>
      <div className="flex-1 h-1.5 bg-white/10 rounded-full max-w-32">
        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default async function FilmPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const l = (locale as Locale) ?? "fr";
  const movieId = Number(id);

  if (isNaN(movieId)) notFound();

  let movie, credits, keywords, similar;
  try {
    [movie, credits, keywords, similar] = await Promise.all([
      getMovie(movieId, l),
      getMovieCredits(movieId),
      getMovieKeywords(movieId),
      getSimilarMovies(movieId, l),
    ]);
  } catch {
    notFound();
  }

  const t = await getTranslations({ locale: l, namespace: "film" });
  const director = credits.crew.find((c) => c.job === "Director");
  const topCast = credits.cast.slice(0, 8);
  const facts = generateReclapFacts(movie, keywords, credits);
  const trailerKey = null;
  const backdropUrl = tmdbImage(movie.backdrop_path, "original");
  const posterUrl = tmdbImage(movie.poster_path, "w500");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Backdrop */}
      {backdropUrl && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <Image src={backdropUrl} alt="" fill className="object-cover opacity-[0.07]" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
      )}

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Nav */}
        <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
            <Link href={`/${l}`}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                {t("backToSearch")}
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-5" />
            <div className="flex items-center gap-2">
              <Clapperboard className="w-5 h-5 text-primary" />
              <span className="font-bold">ReClap</span>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="px-6 pt-10 pb-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="shrink-0">
              <div className="w-48 md:w-56 aspect-[2/3] relative rounded-xl overflow-hidden shadow-2xl glow-red ring-1 ring-white/10">
                {posterUrl ? (
                  <Image src={posterUrl} alt={movie.title} fill className="object-cover" sizes="224px" priority />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Film className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-4 flex-1">
              <div>
                {movie.tagline && (
                  <p className="text-primary text-sm font-medium italic mb-2">{movie.tagline}</p>
                )}
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">{movie.title}</h1>
                {movie.original_title !== movie.title && (
                  <p className="text-muted-foreground text-sm">{movie.original_title}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {movie.genres.map((g) => (
                  <Badge key={g.id} variant="outline" className="border-primary/30 text-primary bg-primary/5">
                    {g.name}
                  </Badge>
                ))}
                {movie.release_date && (
                  <Badge variant="outline" className="border-border text-muted-foreground">
                    {movie.release_date.slice(0, 4)}
                  </Badge>
                )}
                {movie.runtime > 0 && (
                  <Badge variant="outline" className="border-border text-muted-foreground gap-1">
                    <Clock className="w-3 h-3" />
                    {formatRuntime(movie.runtime)}
                  </Badge>
                )}
              </div>

              <StarBar rating={movie.vote_average} />

              <p className="text-muted-foreground leading-relaxed max-w-2xl">{movie.overview}</p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 glow-red">
                  <Eye className="w-4 h-4" /> {t("markWatched")}
                </Button>
                <Button variant="outline" className="border-border/60 hover:bg-white/5 gap-2">
                  <BookmarkPlus className="w-4 h-4" /> {t("addToWatchlist")}
                </Button>
              </div>

              {/* Quick details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {director && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">{t("director")}</p>
                    <p className="text-sm font-medium">{director.name}</p>
                  </div>
                )}
                {movie.original_language && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">{t("language")}</p>
                    <p className="text-sm font-medium uppercase flex items-center gap-1">
                      <Globe className="w-3 h-3" /> {movie.original_language}
                    </p>
                  </div>
                )}
                {movie.budget > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">{t("budget")}</p>
                    <p className="text-sm font-medium">{formatMoney(movie.budget)}</p>
                  </div>
                )}
                {movie.revenue > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">{t("revenue")}</p>
                    <p className="text-sm font-medium">{formatMoney(movie.revenue)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ReClap Facts */}
        {facts.length > 0 && (
          <section className="px-6 py-8 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-2 mb-5">
              <Lightbulb className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">{t("facts")}</h2>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">ReClap</Badge>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {facts.map((fact, i) => (
                <Card key={i} className="border-border/50 bg-card/50 card-hover">
                  <CardContent className="p-4 flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-primary text-xs font-bold">{i + 1}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{fact}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Cast */}
        {topCast.length > 0 && (
          <section className="px-6 py-8 max-w-7xl mx-auto w-full border-t border-border/50">
            <h2 className="text-xl font-bold mb-5">{t("cast")}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
              {topCast.map((actor) => {
                const avatarUrl = tmdbImage(actor.profile_path, "w185");
                return (
                  <div key={actor.id} className="flex flex-col items-center text-center gap-2">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-muted ring-2 ring-border shrink-0">
                      {avatarUrl ? (
                        <Image src={avatarUrl} alt={actor.name} width={56} height={56} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-lg font-bold">
                          {actor.name[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium leading-tight">{actor.name}</p>
                      <p className="text-xs text-muted-foreground leading-tight mt-0.5 line-clamp-1">{actor.character}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Similar films */}
        {similar && similar.results.length > 0 && (
          <section className="px-6 py-8 max-w-7xl mx-auto w-full border-t border-border/50">
            <h2 className="text-xl font-bold mb-5">{t("similar")}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {similar.results.slice(0, 5).map((film) => {
                const poster = tmdbImage(film.poster_path, "w342");
                return (
                  <Link key={film.id} href={`/${l}/film/${film.id}`}>
                    <Card className="border-border/50 bg-card card-hover cursor-pointer overflow-hidden group">
                      <div className="relative h-44">
                        {poster ? (
                          <Image src={poster} alt={film.title} fill className="object-cover" sizes="(max-width: 768px) 50vw, 20vw" />
                        ) : (
                          <div className="h-full flex items-center justify-center bg-muted">
                            <Film className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <p className="font-medium text-xs leading-tight group-hover:text-primary transition-colors line-clamp-2">
                          {film.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{film.release_date?.slice(0, 4)}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-auto border-t border-border/50 px-6 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clapperboard className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">ReClap</span>
            </div>
            <p className="text-xs">Data by TMDB</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
