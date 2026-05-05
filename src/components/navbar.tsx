"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Clapperboard, Search, LayoutDashboard, LogOut, BookOpen, ListVideo, Sparkles, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/75">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 shrink-0" onClick={() => setMobileOpen(false)}>
            <Clapperboard className="w-6 h-6 text-primary" />
            <span className="text-xl font-black tracking-tight">ReClap</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  isActive(l.href) ? "text-foreground bg-white/5" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <l.icon className="w-3.5 h-3.5" />
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Lang switcher */}
            <div className="flex items-center gap-0 text-xs border border-border/50 rounded-lg overflow-hidden">
              <Link href="/fr" className={`px-2.5 py-1.5 transition-colors font-medium ${locale === "fr" ? "bg-primary text-primary-foreground" : "hover:bg-white/5 text-muted-foreground"}`}>FR</Link>
              <Link href="/en" className={`px-2.5 py-1.5 transition-colors font-medium ${locale === "en" ? "bg-primary text-primary-foreground" : "hover:bg-white/5 text-muted-foreground"}`}>EN</Link>
            </div>

            {/* Auth — desktop */}
            <div className="hidden md:flex items-center gap-2">
              {!isPending && (session ? (
                <>
                  <Link href={`/${locale}/dashboard`}>
                    <Button variant="ghost" size="sm" className={`gap-1.5 ${isActive(`/${locale}/dashboard`) ? "text-foreground" : "text-muted-foreground"}`}>
                      <LayoutDashboard className="w-4 h-4" />
                      {t("mySpace")}
                    </Button>
                  </Link>
                  <Link href={`/${locale}/user/${session.user.id}`}>
                    <Avatar className="w-8 h-8 cursor-pointer ring-2 ring-border hover:ring-primary transition-all duration-200">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {session.user.name?.slice(0, 2).toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground w-8 h-8 p-0">
                    <LogOut className="w-3.5 h-3.5" />
                  </Button>
                </>
              ) : (
                <>
                  <Link href={`/${locale}/auth/signin`}>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">{t("login")}</Button>
                  </Link>
                  <Link href={`/${locale}/auth/signup`}>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground glow-red font-semibold">
                      {t("join")}
                    </Button>
                  </Link>
                </>
              ))}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors text-muted-foreground"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="absolute top-16 left-0 right-0 bg-background/95 border-b border-border/50 backdrop-blur-xl p-4 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive(l.href) ? "bg-primary/10 text-primary" : "hover:bg-white/5 text-muted-foreground"
                }`}
              >
                <l.icon className="w-4 h-4" />
                <span className="font-medium">{l.label}</span>
              </Link>
            ))}

            <Separator className="my-2" />

            {!isPending && (session ? (
              <>
                <Link href={`/${locale}/dashboard`} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-muted-foreground transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="font-medium">{t("mySpace")}</span>
                </Link>
                <button onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-muted-foreground transition-colors w-full text-left">
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">{t("logout")}</span>
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-2 pt-1">
                <Link href={`/${locale}/auth/signin`} onClick={() => setMobileOpen(false)} className="flex-1">
                  <Button variant="outline" className="w-full border-border/60">{t("login")}</Button>
                </Link>
                <Link href={`/${locale}/auth/signup`} onClick={() => setMobileOpen(false)} className="flex-1">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">{t("join")}</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
