import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Star, TrendingUp, Film, Users, ChevronRight, Play, Clapperboard, Sparkles, BookOpen, ListVideo } from "lucide-react";
import { getTrending, tmdbImage } from "@/lib/tmdb";
import { NavBar } from "@/components/navbar";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

type Locale = "fr" | "en";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hero" });
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://re-clap.vercel.app";
  return {
    title: `ReClap — ${t("title")} ${t("titleHighlight")}`,
    description: t("description"),
    alternates: { canonical: `${base}/${locale}`, languages: { fr: `${base}/fr`, en: `${base}/en` } },
    openGraph: { url: `${base}/${locale}`, locale: locale === "fr" ? "fr_FR" : "en_US" },
  };
}

function StarRating({ rating }: { rating: number }) {
  const filled = Math.round(rating / 2);
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map((s) => (
        <div key={s} className={`w-2.5 h-2.5 rounded-sm transition-colors ${s <= filled ? "bg-primary" : "bg-white/10"}`} />
      ))}
      <span className="text-xs text-muted-foreground ml-1.5 tabular-nums">{(rating / 2).toFixed(1)}</span>
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
  try { trending = await getTrending(l); } catch {}

  const heroFilm = trending?.results?.[0] as ({ id: number; title: string; poster_path: string | null; backdrop_path?: string | null; release_date: string; vote_average: number } | undefined);
  const heroBackdrop = tmdbImage(heroFilm?.backdrop_path ?? null, "original");

  const FEATURES = [
    { icon: Zap, title: tFeatures("fast.title"), desc: tFeatures("fast.description"), delay: "delay-100" },
    { icon: Star, title: tFeatures("facts.title"), desc: tFeatures("facts.description"), delay: "delay-200" },
    { icon: TrendingUp, title: tFeatures("stats.title"), desc: tFeatures("stats.description"), delay: "delay-300" },
    { icon: Film, title: tFeatures("tracker.title"), desc: tFeatures("tracker.description"), delay: "delay-400" },
  ];

  const NAV_FEATURES = [
    { href: `/${l}/playlists`, icon: Sparkles, label: l === "fr" ? "Playlists" : "Playlists", desc: l === "fr" ? "8 sélections curatoriales" : "8 curated selections" },
    { href: `/${l}/learn`, icon: BookOpen, label: l === "fr" ? "Apprendre" : "Learn", desc: l === "fr" ? "Histoire & techniques" : "History & techniques" },
    { href: `/${l}/pelicules`, icon: ListVideo, label: "Pelicules", desc: l === "fr" ? "Listes collaboratives" : "Collaborative lists" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar locale={l} />

      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Cinematic backdrop */}
        {heroBackdrop && (
          <div className="absolute inset-0 z-0">
            <Image src={heroBackdrop} alt="" fill className="object-cover opacity-[0.12] scale-105" priority sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
          </div>
        )}

        {/* Red ambient glow */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-primary/6 blur-[140px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16 w-full">
          <div className="max-w-2xl">
            <div className="animate-fade-up">
              <Badge variant="outline" className="mb-6 border-primary/40 text-primary bg-primary/5 px-3 py-1.5 text-xs font-medium">
                <Clapperboard className="w-3 h-3 mr-1.5" />
                {tHero("badge")}
              </Badge>
            </div>

            <h1 className="animate-fade-up delay-100 text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.02] mb-6">
              {tHero("title")}{" "}
              <span className="text-gradient-red">{tHero("titleHighlight")}</span>.
            </h1>

            <p className="animate-fade-up delay-200 text-lg text-muted-foreground max-w-lg mb-10 leading-relaxed">
              {tHero("description")}
            </p>

            <div className="animate-fade-up delay-300 flex flex-wrap items-center gap-3">
              <Link href={`/${l}/auth/signup`}>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 text-base glow-red font-semibold">
                  {tHero("cta")} <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link href={`/${l}/search`}>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base border-white/10 hover:bg-white/5 hover:border-white/20">
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  {tHero("demo")}
                </Button>
              </Link>
            </div>

            <div className="animate-fade-up delay-400 flex items-center gap-6 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {["#e11d48","#f97316","#8b5cf6"].map((c,i) => (
                    <div key={i} className="w-6 h-6 rounded-full ring-2 ring-background" style={{ background: c }} />
                  ))}
                </div>
                <span>{tHero("social", { count: 12 })}</span>
              </div>
              <span className="hidden sm:block">·</span>
              <span className="hidden sm:block">{tHero("free")}</span>
            </div>
          </div>

          {/* Hero film card preview */}
          {heroFilm && (
            <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:block animate-fade-in delay-500">
              <Link href={`/${l}/film/${heroFilm.id}`}>
                <div className="group relative w-48 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 hover:ring-primary/50 transition-all duration-300 hover:scale-105">
                  {tmdbImage(heroFilm.poster_path ?? null, "w342") && (
                    <Image src={tmdbImage(heroFilm.poster_path ?? null, "w342")!} alt={heroFilm.title} fill className="object-cover" sizes="192px" priority />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white text-xs font-semibold line-clamp-2 group-hover:text-primary transition-colors">{heroFilm.title}</p>
                    <p className="text-white/60 text-xs mt-0.5">{heroFilm.release_date?.slice(0,4)}</p>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs text-white flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-primary text-primary" />
                    {heroFilm.vote_average.toFixed(1)}
                  </div>
                </div>
              </Link>
              <p className="text-xs text-muted-foreground text-center mt-2">{l === "fr" ? "Tendance" : "Trending"} #1</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── Trending strip ───────────────────────────────────────────── */}
      <section className="px-6 pb-20 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            {tTrending("title")}
          </h2>
          <Link href={`/${l}/search`}>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-xs h-7">
              {tTrending("seeAll")} <ChevronRight className="w-3 h-3 ml-0.5" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {trending
            ? trending.results.slice(0, 5).map((film, i) => (
                <Link key={film.id} href={`/${l}/film/${film.id}`}>
                  <Card className="border-border/40 bg-card/80 card-hover cursor-pointer overflow-hidden group h-full backdrop-blur-sm">
                    <div className="relative h-52">
                      {tmdbImage(film.poster_path ?? null, "w342") ? (
                        <Image src={tmdbImage(film.poster_path ?? null, "w342")!} alt={film.title} fill className="object-cover" sizes="(max-width:768px) 50vw, 20vw" />
                      ) : (
                        <div className="h-full flex items-center justify-center bg-muted"><Film className="w-8 h-8 text-muted-foreground/40" /></div>
                      )}
                      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-white">
                        {i + 1}
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <p className="font-medium text-sm leading-tight mb-1.5 group-hover:text-primary transition-colors line-clamp-1">{film.title}</p>
                      <StarRating rating={film.vote_average} />
                    </CardContent>
                  </Card>
                </Link>
              ))
            : Array.from({length:5}).map((_,i) => (
                <Card key={i} className="border-border/40 bg-card/50 overflow-hidden">
                  <div className="h-52 bg-muted/50 animate-pulse" />
                  <CardContent className="p-3 space-y-2">
                    <div className="h-3 bg-muted/50 rounded animate-pulse w-3/4" />
                    <div className="h-2 bg-muted/50 rounded animate-pulse w-1/2" />
                  </CardContent>
                </Card>
              ))}
        </div>
      </section>

      {/* ─── Feature nav cards ────────────────────────────────────────── */}
      <section className="px-6 pb-20 max-w-7xl mx-auto w-full">
        <div className="grid sm:grid-cols-3 gap-3">
          {NAV_FEATURES.map((f) => (
            <Link key={f.href} href={f.href}>
              <Card className="border-border/40 bg-card/60 card-hover cursor-pointer group p-5 h-full backdrop-blur-sm">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-bold mb-0.5 group-hover:text-primary transition-colors">{f.label}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────────────── */}
      <section className="px-6 py-20 border-t border-border/30 max-w-7xl mx-auto w-full">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black mb-3">{tFeatures("title")}</h2>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">{tFeatures("subtitle")}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <Card key={f.title} className={`border-border/40 bg-card/50 p-6 card-hover backdrop-blur-sm animate-fade-up ${f.delay}`}>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 ring-1 ring-primary/20">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-border/30">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center mx-auto mb-6 glow-red-lg">
            <Clapperboard className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
            {tCta("title")}{" "}
            <span className="text-gradient-red">{tCta("titleHighlight")}</span>
          </h2>
          <p className="text-muted-foreground mb-8 text-sm">{tCta("description")}</p>
          <Link href={`/${l}/auth/signup`}>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-10 text-base glow-red font-semibold">
              {tCta("button")} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-border/30 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clapperboard className="w-4 h-4 text-primary" />
            <span className="font-bold text-foreground">ReClap</span>
            <span>© {new Date().getFullYear()}</span>
            <span className="hidden sm:block">·</span>
            <span className="hidden sm:block">Powered by TMDB</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">{tFooter("privacy")}</a>
            <a href="#" className="hover:text-foreground transition-colors">{tFooter("terms")}</a>
            <a href="#" className="hover:text-foreground transition-colors">{tFooter("contact")}</a>
            <Link href={`/${l}/learn`} className="hover:text-foreground transition-colors">{l === "fr" ? "Apprendre" : "Learn"}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
