import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clapperboard, Zap, Star, TrendingUp, Film, Users, ChevronRight, Play } from "lucide-react";
import { getTrending, tmdbImage } from "@/lib/tmdb";
import Link from "next/link";
import Image from "next/image";

type Locale = "fr" | "en";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hero" });
  return {
    title: `ReClap — ${t("title")} ${t("titleHighlight")}`,
    description: t("description"),
  };
}

function NavBar({ locale }: { locale: Locale }) {
  const t = useTranslations("nav");
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <Clapperboard className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">ReClap</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">{t("discover")}</a>
          <a href="#" className="hover:text-foreground transition-colors">{t("films")}</a>
          <a href="#" className="hover:text-foreground transition-colors">{t("actors")}</a>
          <a href="#" className="hover:text-foreground transition-colors">{t("community")}</a>
        </nav>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs border border-border/50 rounded-md overflow-hidden">
            <Link href="/fr" className={`px-2 py-1 transition-colors ${locale === "fr" ? "bg-primary text-primary-foreground" : "hover:bg-white/5"}`}>FR</Link>
            <Link href="/en" className={`px-2 py-1 transition-colors ${locale === "en" ? "bg-primary text-primary-foreground" : "hover:bg-white/5"}`}>EN</Link>
          </div>
          <Button variant="ghost" size="sm">{t("login")}</Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground glow-red">
            {t("join")}
          </Button>
        </div>
      </div>
    </header>
  );
}

function StarRating({ rating }: { rating: number }) {
  const filled = Math.round(rating / 2);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <div key={star} className={`w-3 h-3 rounded-sm ${star <= filled ? "bg-primary" : "bg-white/10"}`} />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{(rating / 2).toFixed(1)}</span>
    </div>
  );
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (locale as Locale) ?? "fr";

  const [tHero, tTrending, tFeatures, tCta, tFooter] = await Promise.all([
    getTranslations({ locale: l, namespace: "hero" }),
    getTranslations({ locale: l, namespace: "trending" }),
    getTranslations({ locale: l, namespace: "features" }),
    getTranslations({ locale: l, namespace: "cta" }),
    getTranslations({ locale: l, namespace: "footer" }),
  ]);

  let trending = null;
  try {
    trending = await getTrending(l);
  } catch {
    // TMDB not configured yet
  }

  const FEATURES = [
    { icon: Zap, title: tFeatures("fast.title"), description: tFeatures("fast.description") },
    { icon: Star, title: tFeatures("facts.title"), description: tFeatures("facts.description") },
    { icon: TrendingUp, title: tFeatures("stats.title"), description: tFeatures("stats.description") },
    { icon: Film, title: tFeatures("tracker.title"), description: tFeatures("tracker.description") },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar locale={l} />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-primary/8 blur-[120px]" />
        </div>
        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-6 border-primary/40 text-primary bg-primary/5 px-3 py-1">
              <Clapperboard className="w-3 h-3 mr-1.5" />
              {tHero("badge")}
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
              {tHero("title")}{" "}
              <span className="text-gradient-red">{tHero("titleHighlight")}</span>.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed">
              {tHero("description")}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 text-base glow-red">
                {tHero("cta")} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base border-white/10 hover:bg-white/5">
                <Play className="w-4 h-4 mr-2 fill-current" />
                {tHero("demo")}
              </Button>
            </div>
            <div className="flex items-center gap-6 mt-10 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>{tHero("social", { count: 12 })}</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <span>{tHero("free")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trending films */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
              {tTrending("title")}
            </h2>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
              {tTrending("seeAll")} <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {trending
              ? trending.results.slice(0, 5).map((film) => (
                  <Link key={film.id} href={`/${l}/film/${film.id}`}>
                    <Card className="border-border/50 bg-card card-hover cursor-pointer overflow-hidden group h-full">
                      <div className="relative h-52">
                        {film.poster_path ? (
                          <Image
                            src={tmdbImage(film.poster_path, "w342")!}
                            alt={film.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 20vw"
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center bg-muted">
                            <Film className="w-10 h-10 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <p className="font-medium text-sm leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-1">
                          {film.title}
                        </p>
                        <p className="text-xs text-muted-foreground mb-2">
                          {film.release_date?.slice(0, 4)}
                        </p>
                        <StarRating rating={film.vote_average} />
                      </CardContent>
                    </Card>
                  </Link>
                ))
              : Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="border-border/50 bg-card overflow-hidden">
                    <div className="h-52 bg-muted animate-pulse" />
                    <CardContent className="p-3 space-y-2">
                      <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                      <div className="h-2 bg-muted rounded animate-pulse w-1/3" />
                    </CardContent>
                  </Card>
                ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{tFeatures("title")}</h2>
            <p className="text-muted-foreground max-w-md mx-auto">{tFeatures("subtitle")}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f) => (
              <Card key={f.title} className="border-border/50 bg-card/50 p-6 card-hover">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 border-t border-border/50">
        <div className="max-w-2xl mx-auto text-center">
          <Clapperboard className="w-12 h-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {tCta("title")}{" "}
            <span className="text-gradient-red">{tCta("titleHighlight")}</span>
          </h2>
          <p className="text-muted-foreground mb-8">{tCta("description")}</p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-10 text-base glow-red">
            {tCta("button")} <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/50 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clapperboard className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">ReClap</span>
            <span>© 2025</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">{tFooter("privacy")}</a>
            <a href="#" className="hover:text-foreground transition-colors">{tFooter("terms")}</a>
            <a href="#" className="hover:text-foreground transition-colors">{tFooter("contact")}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
