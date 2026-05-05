"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clapperboard, Search, LayoutDashboard, LogOut, BookOpen, ListVideo, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession, signOut } from "@/lib/auth-client";

type Locale = "fr" | "en";

interface NavBarProps {
  locale: Locale;
}

export function NavBar({ locale }: NavBarProps) {
  const t = useTranslations("nav");
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push(`/${locale}`);
    router.refresh();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <Clapperboard className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">ReClap</span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm text-muted-foreground">
          <Link href={`/${locale}/search`} className="hover:text-foreground transition-colors flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" /> {t("discover")}
          </Link>
          <Link href={`/${locale}/playlists`} className="hover:text-foreground transition-colors flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> {locale === "fr" ? "Playlists" : "Playlists"}
          </Link>
          <Link href={`/${locale}/pelicules`} className="hover:text-foreground transition-colors flex items-center gap-1.5">
            <ListVideo className="w-3.5 h-3.5" /> Pelicules
          </Link>
          <Link href={`/${locale}/learn`} className="hover:text-foreground transition-colors flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> {locale === "fr" ? "Apprendre" : "Learn"}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5 text-xs border border-border/50 rounded-md overflow-hidden">
            <Link href="/fr" className={`px-2 py-1 transition-colors ${locale === "fr" ? "bg-primary text-primary-foreground" : "hover:bg-white/5"}`}>FR</Link>
            <Link href="/en" className={`px-2 py-1 transition-colors ${locale === "en" ? "bg-primary text-primary-foreground" : "hover:bg-white/5"}`}>EN</Link>
          </div>

          {!isPending && (
            session ? (
              <div className="flex items-center gap-2">
                <Link href={`/${locale}/dashboard`}>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden md:inline">{t("mySpace")}</span>
                  </Button>
                </Link>
                <Link href={`/${locale}/user/${session.user.id}`}>
                  <Avatar className="w-8 h-8 cursor-pointer ring-2 ring-border hover:ring-primary transition-colors">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {session.user.name?.slice(0, 2).toUpperCase() ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <Link href={`/${locale}/auth/signin`}>
                  <Button variant="ghost" size="sm">{t("login")}</Button>
                </Link>
                <Link href={`/${locale}/auth/signup`}>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground glow-red">
                    {t("join")}
                  </Button>
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </header>
  );
}
