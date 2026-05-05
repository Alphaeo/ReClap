"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, LayoutDashboard, LogOut, BookOpen, ListVideo, Sparkles, Menu, X, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useSession, signOut } from "@/lib/auth-client";

type Locale = "fr" | "en";

export function NavBar({ locale }: { locale: Locale }) {
  const t = useTranslations("nav");
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setMobileOpen(false);
    router.push(`/${locale}`);
    router.refresh();
  };

  const NAV_LINKS = [
    { href: `/${locale}/search`, icon: Search, label: t("discover") },
    { href: `/${locale}/playlists`, icon: Sparkles, label: "Playlists" },
    { href: `/${locale}/pelicules`, icon: ListVideo, label: "Pelicules" },
    { href: `/${locale}/learn`, icon: BookOpen, label: locale === "fr" ? "Apprendre" : "Learn" },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 backdrop-blur-xl bg-background/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-14 flex items-center justify-between gap-6">

          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-3 shrink-0 group" onClick={() => setMobileOpen(false)}>
            <div className="w-7 h-7 bg-primary flex items-center justify-center glow-red transition-all group-hover:glow-red-lg">
              <span className="font-display font-bold text-xs text-primary-foreground italic">R</span>
            </div>
            <span className="font-display font-bold text-lg tracking-tight">ReClap</span>
          </Link>

          {/* Desktop nav — monospace labels */}
          <nav className="hidden md:flex items-center gap-0">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1.5 px-4 py-1 font-mono text-[11px] tracking-[0.08em] uppercase transition-colors
                  ${isActive(link.href)
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-4 right-4 h-[1px] bg-primary" />
                )}
                <span className="text-primary/40 font-mono text-[9px] mr-0.5">{String(i+1).padStart(2,"0")}</span>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Lang */}
            <div className="hidden sm:flex items-center gap-0 border border-border/40 overflow-hidden">
              <Link href="/fr" className={`font-mono text-[10px] px-2.5 py-1.5 tracking-widest transition-colors ${locale === "fr" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>FR</Link>
              <Link href="/en" className={`font-mono text-[10px] px-2.5 py-1.5 tracking-widest transition-colors ${locale === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>EN</Link>
            </div>

            {/* Auth — desktop */}
            <div className="hidden md:flex items-center gap-2">
              {!isPending && (session ? (
                <>
                  <Link href={`/${locale}/dashboard`}>
                    <button className={`flex items-center gap-1.5 font-mono text-[11px] tracking-wide uppercase px-3 py-1.5 border border-border/30 hover:border-primary/40 transition-colors ${isActive(`/${locale}/dashboard`) ? "text-primary border-primary/40" : "text-muted-foreground"}`}>
                      <LayoutDashboard className="w-3 h-3" />
                      {t("mySpace")}
                    </button>
                  </Link>
                  <Link href={`/${locale}/user/${session.user.id}`}>
                    <Avatar className="w-7 h-7 cursor-pointer ring-1 ring-border hover:ring-primary transition-all duration-200">
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-mono font-bold">
                        {session.user.name?.slice(0, 2).toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <button onClick={handleSignOut} className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <Link href={`/${locale}/auth/signin`}>
                    <button className="font-mono text-[11px] tracking-wide uppercase text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">
                      {t("login")}
                    </button>
                  </Link>
                  <Link href={`/${locale}/auth/signup`}>
                    <button className="font-mono text-[11px] tracking-wide uppercase bg-primary text-primary-foreground px-4 py-1.5 hover:bg-primary/90 transition-colors glow-red flex items-center gap-1.5">
                      {t("join")} <ChevronRight className="w-3 h-3" />
                    </button>
                  </Link>
                </>
              ))}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="absolute top-14 left-0 right-0 bg-background border-b border-border/30 py-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lang mobile */}
            <div className="flex items-center gap-0 border border-border/40 mx-4 mb-4 w-fit">
              <Link href="/fr" onClick={() => setMobileOpen(false)} className={`font-mono text-[10px] px-3 py-2 tracking-widest transition-colors ${locale === "fr" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>FR</Link>
              <Link href="/en" onClick={() => setMobileOpen(false)} className={`font-mono text-[10px] px-3 py-2 tracking-widest transition-colors ${locale === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>EN</Link>
            </div>

            <div className="space-y-0.5 px-2">
              {NAV_LINKS.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${isActive(link.href) ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-white/3"}`}
                >
                  <span className="font-mono text-[9px] text-muted-foreground/40">{String(i+1).padStart(2,"0")}</span>
                  <link.icon className="w-4 h-4" />
                  <span className="font-mono text-[11px] tracking-widest uppercase">{link.label}</span>
                </Link>
              ))}
            </div>

            <Separator className="my-3 bg-border/20" />

            <div className="px-6">
              {!isPending && (session ? (
                <div className="space-y-2">
                  <Link href={`/${locale}/dashboard`} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors py-2">
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="font-mono text-[11px] tracking-widest uppercase">{t("mySpace")}</span>
                  </Link>
                  <button onClick={handleSignOut} className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors py-2 w-full">
                    <LogOut className="w-4 h-4" />
                    <span className="font-mono text-[11px] tracking-widest uppercase">{t("logout")}</span>
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link href={`/${locale}/auth/signin`} onClick={() => setMobileOpen(false)} className="flex-1">
                    <button className="w-full border border-border/40 font-mono text-[11px] tracking-widest uppercase text-muted-foreground py-2.5 hover:text-foreground transition-colors">{t("login")}</button>
                  </Link>
                  <Link href={`/${locale}/auth/signup`} onClick={() => setMobileOpen(false)} className="flex-1">
                    <button className="w-full bg-primary text-primary-foreground font-mono text-[11px] tracking-widest uppercase py-2.5">{t("join")}</button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
