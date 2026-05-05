import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Zap, Star, TrendingUp, Film, ChevronRight, Play, Sparkles, BookOpen, ListVideo } from "lucide-react";
import { getTrending, tmdbImage } from "@/lib/tmdb";
import { NavBar } from "@/components/navbar";
import { FilmCard } from "@/components/film-card";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

type Locale = "fr" | "en";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://re-clap.vercel.app";
  return {
    title: locale === "fr" ? "ReClap — Ton cinéma, réinventé" : "ReClap — Your cinema, reimagined",
    alternates: { canonical: `${base}/${locale}`, languages: { fr: `${base}/fr`, en: `${base}/en` } },
  };
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
    { icon: Zap, num: "01", title: tFeatures("fast.title"), desc: tFeatures("fast.description") },
    { icon: Star, num: "02", title: tFeatures("facts.title"), desc: tFeatures("facts.description") },
    { icon: TrendingUp, num: "03", title: tFeatures("stats.title"), desc: tFeatures("stats.description") },
    { icon: Film, num: "04", title: tFeatures("tracker.title"), desc: tFeatures("tracker.description") },
  ];

  const NAV_FEATURES = [
    { href: `/${l}/playlists`, icon: Sparkles, label: "Playlists", desc: l === "fr" ? "8 sélections curatoriales" : "8 curated selections" },
    { href: `/${l}/learn`, icon: BookOpen, label: l === "fr" ? "Apprendre" : "Learn", desc: l === "fr" ? "Histoire & techniques" : "History & techniques" },
    { href: `/${l}/pelicules`, icon: ListVideo, label: "Pelicules", desc: l === "fr" ? "Listes collaboratives" : "Collaborative lists" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar locale={l} />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Full-bleed backdrop */}
        {heroBackdrop && (
          <div className="absolute inset-0 z-0">
            <Image src={heroBackdrop} alt="" fill className="object-cover opacity-[0.13]" priority sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
          </div>
        )}

        {/* Vertical red accent line */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] z-10 hidden lg:block">
          <div className="animate-fade-up delay-500 h-full bg-gradient-to-b from-transparent via-primary to-transparent opacity-60" />
        </div>

        <div className="relative z-10 flex-1 max-w-7xl mx-auto px-6 lg:px-12 w-full pt-28 pb-16 flex items-center">
          <div className="w-full grid lg:grid-cols-[1fr_auto] gap-16 items-center">

            {/* Left: Copy */}
            <div className="max-w-2xl">
              {/* Frame counter */}
              <div className="animate-fade-up flex items-center gap-4 mb-8">
                <span className="font-mono text-xs text-primary tracking-[0.2em]">001</span>
                <div className="h-px flex-1 max-w-[60px] bg-primary/40" />
                <span className="font-mono text-xs text-muted-foreground tracking-[0.15em] uppercase">
                  {l === "fr" ? "Cinéma · Culture · Communauté" : "Cinema · Culture · Community"}
                </span>
              </div>

              {/* Main headline */}
              <div className="animate-fade-up delay-150 mb-6">
                <h1 className="font-display font-light text-[clamp(3.5rem,8vw,7rem)] leading-[0.92] tracking-tight">
                  <span className="block text-foreground/90">{tHero("title")}</span>
                  <span className="block italic text-gradient-red">{tHero("titleHighlight")}.</span>
                </h1>
              </div>

              {/* Red rule */}
              <div className="animate-fade-up delay-250 red-rule mb-6 max-w-xs" />

              <p className="animate-fade-up delay-250 font-sans text-base text-muted-foreground max-w-md leading-relaxed mb-10">
                {tHero("description")}
              </p>

              {/* CTA group */}
              <div className="animate-fade-up delay-350 flex flex-wrap items-center gap-4 mb-12">
                <Link href={`/${l}/auth/signup`}>
                  <button className="group relative h-12 px-8 bg-primary text-primary-foreground font-sans text-sm font-semibold glow-red overflow-hidden transition-all hover:glow-red-lg">
                    <span className="relative z-10 flex items-center gap-2">
                      {tHero("cta")}
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </Link>
                <Link href={`/${l}/search`}>
                  <button className="h-12 px-8 border border-border/40 font-sans text-sm text-muted-foreground flex items-center gap-2 hover:text-foreground hover:border-border transition-colors">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {tHero("demo")}
                  </button>
                </Link>
              </div>

              {/* Stats row */}
              <div className="animate-fade-up delay-500 flex items-center gap-6">
                {[
                  { num: "12k", label: l === "fr" ? "cinéphiles" : "film lovers" },
                  { num: "∞", label: l === "fr" ? "films tracés" : "films tracked" },
                  { num: "100%", label: l === "fr" ? "gratuit" : "free" },
                ].map((s, i) => (
                  <div key={i} className="flex items-baseline gap-2">
                    <span className="font-display font-bold text-2xl text-foreground">{s.num}</span>
                    <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</span>
                    {i < 2 && <span className="text-border ml-2">·</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Hero film card — tilted, floating */}
            {heroFilm && (
              <div className="hidden lg:block animate-fade-in delay-700 relative">
                <div className="relative" style={{ transform: "rotate(-4deg)" }}>
                  <Link href={`/${l}/film/${heroFilm.id}`}>
                    <div className="w-52 aspect-[2/3] relative overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.7)] ring-1 ring-white/10 hover:ring-primary/40 transition-all duration-500 hover:rotate-0 hover:scale-105" style={{ transition: "all 0.4s cubic-bezier(.22,1,.36,1)" }}>
                      {tmdbImage(heroFilm.poster_path, "w342") && (
                        <Image src={tmdbImage(heroFilm.poster_path, "w342")!} alt={heroFilm.title} fill className="object-cover" sizes="208px" priority />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="font-mono text-[9px] text-primary/80 tracking-widest uppercase mb-1">
                          {l === "fr" ? "Tendance #1" : "Trending #1"}
                        </div>
                        <p className="font-display text-sm text-white font-semibold leading-tight">{heroFilm.title}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Star className="w-2.5 h-2.5 fill-primary text-primary" />
                          <span className="font-mono text-[10px] text-white/70">{heroFilm.vote_average.toFixed(1)}</span>
                          <span className="font-mono text-[10px] text-white/40">· {heroFilm.release_date?.slice(0,4)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                  {/* Shadow under card */}
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-8 bg-primary/10 blur-xl rounded-full" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── TRENDING ─────────────────────────────────────────────── */}
      <section className="px-6 lg:px-12 py-20 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <span className="section-label">002 / {tTrending("title")}</span>
          </div>
          <Link href={`/${l}/search`} className="font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors tracking-widest uppercase flex items-center gap-1.5">
            {tTrending("seeAll")} →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {trending
            ? trending.results.slice(0, 5).map((film, i) => (
                <Suspense key={film.id} fallback={<div className="aspect-[2/3] bg-muted animate-pulse" />}>
                  <FilmCard film={film} locale={l} rank={i + 1} />
                </Suspense>
              ))
            : Array.from({length:5}).map((_,i) => (
                <div key={i} className="aspect-[2/3] bg-muted/30 animate-pulse" />
              ))}
        </div>
      </section>

      {/* ── FEATURE NAV CARDS ────────────────────────────────────── */}
      <section className="px-6 lg:px-12 pb-20 max-w-7xl mx-auto w-full">
        <div className="grid sm:grid-cols-3 gap-2">
          {NAV_FEATURES.map((f, i) => (
            <Link key={f.href} href={f.href}>
              <div className="group border border-border/30 p-6 hover:border-primary/30 transition-all duration-300 hover:bg-card/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                <div className="flex items-start justify-between mb-4">
                  <f.icon className="w-5 h-5 text-primary" />
                  <span className="font-mono text-[10px] text-muted-foreground/50">{String(i+1).padStart(2,"0")}</span>
                </div>
                <h3 className="font-display text-xl font-semibold mb-1 group-hover:text-primary transition-colors">{f.label}</h3>
                <p className="font-mono text-[11px] text-muted-foreground tracking-wide">{f.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section className="px-6 lg:px-12 py-24 border-t border-border/20 max-w-7xl mx-auto w-full">
        <div className="mb-16">
          <span className="section-label block mb-4">003 / {tFeatures("title")}</span>
          <div className="red-rule max-w-[80px]" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-border/20">
          {FEATURES.map((f) => (
            <div key={f.num} className="bg-background p-8 group hover:bg-card/50 transition-colors duration-300">
              <div className="font-mono text-4xl font-bold text-border/30 mb-6 group-hover:text-primary/20 transition-colors">{f.num}</div>
              <f.icon className="w-5 h-5 text-primary mb-4" />
              <h3 className="font-display text-xl font-semibold mb-3">{f.title}</h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="relative px-6 lg:px-12 py-32 overflow-hidden border-t border-border/20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-primary/5 blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <span className="section-label block mb-8">004 / {l === "fr" ? "Rejoindre" : "Join"}</span>
          <h2 className="font-display font-light text-[clamp(2.5rem,5vw,5rem)] leading-[0.95] tracking-tight mb-4">
            {tCta("title")}
            <br />
            <span className="italic text-gradient-red">{tCta("titleHighlight")}</span>
          </h2>
          <div className="red-rule max-w-[60px] mx-auto my-8" />
          <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase mb-10">{tCta("description")}</p>
          <Link href={`/${l}/auth/signup`}>
            <button className="group h-14 px-12 bg-primary text-primary-foreground font-sans font-semibold text-base glow-red hover:glow-red-lg transition-all duration-300 flex items-center gap-3 mx-auto">
              {tCta("button")}
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="border-t border-border/20 px-6 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-display font-bold text-lg">ReClap</span>
            <span className="font-mono text-[10px] text-muted-foreground/50 tracking-widest">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6 font-mono text-[10px] text-muted-foreground tracking-widest uppercase">
            <a href="#" className="hover:text-foreground transition-colors">{tFooter("privacy")}</a>
            <a href="#" className="hover:text-foreground transition-colors">{tFooter("terms")}</a>
            <Link href={`/${l}/learn`} className="hover:text-foreground transition-colors">{l === "fr" ? "Apprendre" : "Learn"}</Link>
            <span className="text-muted-foreground/30">TMDB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
