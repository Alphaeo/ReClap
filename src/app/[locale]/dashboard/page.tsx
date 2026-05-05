import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Clapperboard, Film, Star, Clock, BarChart2, BookmarkCheck, CalendarDays, TrendingUp, ArrowLeft } from "lucide-react";

type Locale = "fr" | "en";

const MOCK_WATCHED = [
  { id: 872585, title: "Oppenheimer", year: 2023, rating: 4.5, genre: "Biopic" },
  { id: 693134, title: "Dune: Part Two", year: 2024, rating: 4.0, genre: "Sci-Fi" },
  { id: 792307, title: "Poor Things", year: 2023, rating: 4.8, genre: "Drame" },
  { id: 1096197, title: "No Hard Feelings", year: 2023, rating: 3.5, genre: "Comédie" },
  { id: 940551, title: "Migration", year: 2023, rating: 3.0, genre: "Animation" },
];

const MOCK_GENRES = [
  { name: "Drame", count: 24, pct: 80 },
  { name: "Sci-Fi", count: 18, pct: 60 },
  { name: "Thriller", count: 14, pct: 47 },
  { name: "Animation", count: 9, pct: 30 },
  { name: "Comédie", count: 7, pct: 23 },
];

const MOCK_ACTORS = [
  { name: "Cillian Murphy", count: 6 },
  { name: "Timothée Chalamet", count: 5 },
  { name: "Emma Stone", count: 4 },
];

const MOCK_DIRECTORS = [
  { name: "Christopher Nolan", count: 8 },
  { name: "Denis Villeneuve", count: 6 },
  { name: "Yorgos Lanthimos", count: 4 },
];

const MONTHS_ACTIVITY = [3, 5, 2, 8, 4, 7, 6, 9, 3, 5, 4, 6];
const MONTH_LABELS_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
const MONTH_LABELS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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
  const t = await getTranslations({ locale: l, namespace: "dashboard" });
  const monthLabels = l === "fr" ? MONTH_LABELS_FR : MONTH_LABELS_EN;
  const maxActivity = Math.max(...MONTHS_ACTIVITY);

  const totalWatched = 72;
  const totalHours = 134;
  const totalReviews = 38;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href={`/${l}`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              ReClap
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-5" />
          <Clapperboard className="w-5 h-5 text-primary" />
          <h1 className="font-bold text-lg">{t("title")}</h1>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="w-16 h-16 ring-2 ring-primary/30">
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">U</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">Utilisateur</h2>
            <p className="text-muted-foreground text-sm">Cinéphile depuis 2025</p>
          </div>
        </div>

        {/* Stats row */}
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
          {/* Left: Journal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent activity */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  {t("recentActivity")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {MOCK_WATCHED.map((film) => (
                  <Link key={film.id} href={`/${l}/film/${film.id}`}>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                        <Film className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                          {film.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">{film.year}</p>
                          <Badge variant="outline" className="text-xs border-border/50 py-0 h-4">{film.genre}</Badge>
                        </div>
                      </div>
                      <StarRating rating={film.rating} />
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Yearly activity chart */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-primary" />
                  {t("yearlyActivity")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-28">
                  {MONTHS_ACTIVITY.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-sm bg-primary/20 hover:bg-primary/40 transition-colors cursor-default"
                        style={{ height: `${(val / maxActivity) * 100}%`, minHeight: "4px" }}
                        title={`${val} films`}
                      />
                      <span className="text-xs text-muted-foreground">{monthLabels[i]}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Stats */}
          <div className="space-y-4">
            {/* Top genres */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  {t("topGenres")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {MOCK_GENRES.map((g) => (
                  <div key={g.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{g.name}</span>
                      <span className="text-muted-foreground">{g.count}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${g.pct}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top actors */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" />
                  {t("topActors")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {MOCK_ACTORS.map((a, i) => (
                  <div key={a.name} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4 text-right">{i + 1}</span>
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {a.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium flex-1">{a.name}</span>
                    <Badge variant="outline" className="text-xs border-border/50">{a.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top directors */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookmarkCheck className="w-4 h-4 text-primary" />
                  {t("topDirectors")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {MOCK_DIRECTORS.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4 text-right">{i + 1}</span>
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {d.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium flex-1">{d.name}</span>
                    <Badge variant="outline" className="text-xs border-border/50">{d.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
