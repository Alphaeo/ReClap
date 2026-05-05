import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { NavBar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { watchedFilms, watchlist } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { tmdbImage } from "@/lib/tmdb";
import { Film, Star, Clock, BarChart2, BookmarkCheck, TrendingUp, CalendarDays } from "lucide-react";

type Locale = "fr" | "en";
const MONTH_LABELS_FR = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
const MONTH_LABELS_EN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? "text-primary fill-primary" : "text-white/20"}`} />
      ))}
    </div>
  );
}

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (locale as Locale) ?? "fr";
  const session = await getSession();
  if (!session?.user) redirect(`/${l}/auth/signin`);

  const t = await getTranslations({ locale: l, namespace: "dashboard" });
  const monthLabels = l === "fr" ? MONTH_LABELS_FR : MONTH_LABELS_EN;

  const [userWatched, userWatchlist] = await Promise.all([
    db.select().from(watchedFilms).where(eq(watchedFilms.userId, session.user.id)).orderBy(desc(watchedFilms.watchedAt)),
    db.select().from(watchlist).where(eq(watchlist.userId, session.user.id)).orderBy(desc(watchlist.addedAt)),
  ]);

  // Stats
  const totalWatched = userWatched.length;
  const totalReviews = userWatched.filter((f) => f.review).length;
  const totalHours = Math.round(userWatched.reduce((acc, f) => acc + (f.runtime ?? 120), 0) / 60);

  // Genre stats
  const genreMap = new Map<string, number>();
  for (const f of userWatched) {
    if (f.genres) {
      try {
        const gs: string[] = JSON.parse(f.genres);
        gs.forEach((g) => genreMap.set(g, (genreMap.get(g) ?? 0) + 1));
      } catch { /* skip */ }
    }
  }
  const topGenres = [...genreMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxGenreCount = topGenres[0]?.[1] ?? 1;

  // Monthly activity (current year)
  const currentYear = new Date().getFullYear();
  const monthlyActivity = Array(12).fill(0);
  for (const f of userWatched) {
    const d = new Date(f.watchedAt);
    if (d.getFullYear() === currentYear) monthlyActivity[d.getMonth()]++;
  }
  const maxActivity = Math.max(...monthlyActivity, 1);

  const recentActivity = userWatched.slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar locale={l} />

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 pt-24 pb-8">
        {/* Profile */}
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="w-16 h-16 ring-2 ring-primary/30">
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
              {session.user.name?.slice(0, 2).toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{session.user.name}</h1>
            <p className="text-muted-foreground text-sm">{session.user.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Film, label: t("watched"), value: totalWatched },
            { icon: Clock, label: t("hours"), value: totalHours },
            { icon: Star, label: t("reviews"), value: totalReviews },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label} className="border-border/50 bg-card/50 text-center p-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-3xl font-bold mb-0.5">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Recent activity */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-primary" /> {t("recentActivity")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-6">{t("noActivity")}</p>
                ) : (
                  <div className="space-y-1">
                    {recentActivity.map((film) => {
                      const poster = tmdbImage(film.posterPath, "w185");
                      return (
                        <Link key={film.id} href={`/${l}/film/${film.tmdbId}`}>
                          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer">
                            <div className="w-10 h-14 relative rounded overflow-hidden shrink-0 bg-muted">
                              {poster ? (
                                <Image src={poster} alt={film.title} fill className="object-cover" sizes="40px" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Film className="w-4 h-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">{film.title}</p>
                              <p className="text-xs text-muted-foreground">{film.releaseYear}</p>
                              {film.rating && <StarRating rating={film.rating} />}
                            </div>
                            {film.review && (
                              <p className="text-xs text-muted-foreground max-w-32 truncate hidden md:block">{film.review}</p>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity chart */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-primary" /> {t("yearlyActivity")} {currentYear}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-1.5 h-28">
                  {monthlyActivity.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-sm bg-primary/20 hover:bg-primary/50 transition-colors"
                        style={{ height: `${(val / maxActivity) * 100}%`, minHeight: val > 0 ? "4px" : "2px" }}
                        title={`${val} film${val > 1 ? "s" : ""}`}
                      />
                      <span className="text-xs text-muted-foreground">{monthLabels[i]}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Watchlist */}
            {userWatchlist.length > 0 && (
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookmarkCheck className="w-4 h-4 text-primary" /> {t("watchlist")}
                    <Badge variant="outline" className="text-xs">{userWatchlist.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {userWatchlist.slice(0, 10).map((film) => {
                      const poster = tmdbImage(film.posterPath, "w185");
                      return (
                        <Link key={`${film.userId}-${film.tmdbId}`} href={`/${l}/film/${film.tmdbId}`} className="shrink-0">
                          <div className="w-16 h-24 relative rounded overflow-hidden bg-muted ring-1 ring-border hover:ring-primary transition-colors">
                            {poster ? (
                              <Image src={poster} alt={film.title} fill className="object-cover" sizes="64px" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Film className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Genre stats */}
          <div className="space-y-4">
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> {t("topGenres")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topGenres.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("noActivity")}</p>
                ) : (
                  <div className="space-y-3">
                    {topGenres.map(([genre, count]) => (
                      <div key={genre}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{genre}</span>
                          <span className="text-muted-foreground">{count}</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${(count / maxGenreCount) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 p-4">
              <Link href={`/${l}/search`}>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  {l === "fr" ? "Découvrir des films" : "Discover films"}
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
