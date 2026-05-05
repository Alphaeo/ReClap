import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { NavBar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { users, watchedFilms } from "@/lib/db/schema";
import { eq, desc, isNotNull } from "drizzle-orm";
import { tmdbImage } from "@/lib/tmdb";
import { Film, Star } from "lucide-react";

type Locale = "fr" | "en";

export default async function PublicProfilePage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const l = (locale as Locale) ?? "fr";
  const t = await getTranslations({ locale: l, namespace: "profile" });

  let user, userFilms;
  try {
    [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!user) notFound();
    userFilms = await db.select().from(watchedFilms)
      .where(eq(watchedFilms.userId, id))
      .orderBy(desc(watchedFilms.watchedAt))
      .limit(20);
  } catch {
    notFound();
  }

  const reviewCount = userFilms.filter((f) => f.review).length;
  const memberSince = new Date(user.createdAt).toLocaleDateString(l === "fr" ? "fr-FR" : "en-US", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar locale={l} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 pt-24 pb-12">
        {/* Profile header */}
        <div className="flex items-center gap-5 mb-10">
          <Avatar className="w-20 h-20 ring-2 ring-primary/30">
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
              {user.name?.slice(0, 2).toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("memberSince")} {memberSince}</p>
            <div className="flex gap-4 mt-2 text-sm">
              <span><strong>{userFilms.length}</strong> <span className="text-muted-foreground">{t("watched")}</span></span>
              <span><strong>{reviewCount}</strong> <span className="text-muted-foreground">{t("reviews")}</span></span>
            </div>
          </div>
        </div>

        {/* Films */}
        {userFilms.length === 0 ? (
          <p className="text-muted-foreground text-center py-16">{t("noActivity")}</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {userFilms.map((film) => {
              const poster = tmdbImage(film.posterPath, "w342");
              return (
                <Link key={film.id} href={`/${l}/film/${film.tmdbId}`}>
                  <div className="group relative">
                    <div className="aspect-[2/3] relative rounded-lg overflow-hidden bg-muted ring-1 ring-border group-hover:ring-primary transition-colors">
                      {poster ? (
                        <Image src={poster} alt={film.title} fill className="object-cover" sizes="200px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      {film.rating && (
                        <div className="absolute bottom-1 left-1 bg-black/70 rounded px-1 flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 text-primary fill-primary" />
                          <span className="text-xs text-white">{film.rating}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium mt-1 leading-tight group-hover:text-primary transition-colors line-clamp-1">{film.title}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
