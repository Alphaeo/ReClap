import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { NavBar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { lists, listMembers, listFilms, users } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { tmdbImage } from "@/lib/tmdb";
import { Film, Users, Link2, ArrowLeft, Trash2, Star } from "lucide-react";
import { InviteButton } from "./invite-button";
import { RemoveFilmButton } from "./remove-film-button";

type Locale = "fr" | "en";

export default async function PeliculePage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const l = (locale as Locale) ?? "fr";
  const session = await getSession();
  if (!session?.user) redirect(`/${l}/auth/signin`);

  const [list] = await db.select().from(lists).where(eq(lists.id, id)).limit(1);
  if (!list) notFound();

  const [memberRows, films] = await Promise.all([
    db.select({ userId: listMembers.userId, role: listMembers.role })
      .from(listMembers).where(eq(listMembers.listId, id)),
    db.select().from(listFilms).where(eq(listFilms.listId, id)).orderBy(asc(listFilms.position)),
  ]);

  const myMember = memberRows.find((m) => m.userId === session.user.id);
  if (!myMember && !list.isPublic) notFound();

  const canEdit = myMember && myMember.role !== "viewer";
  const isOwner = myMember?.role === "owner";

  const memberUsers = await Promise.all(
    memberRows.map(async (m) => {
      const [u] = await db.select({ id: users.id, name: users.name }).from(users).where(eq(users.id, m.userId)).limit(1);
      return { ...u, role: m.role };
    })
  );

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar locale={l} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-24 pb-12">
        {/* Header */}
        <Link href={`/${l}/pelicules`}>
          <Button variant="ghost" size="sm" className="gap-2 mb-6">
            <ArrowLeft className="w-4 h-4" /> Pelicules
          </Button>
        </Link>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{list.name}</h1>
              <Badge variant="outline" className="border-primary/30 text-primary text-xs">
                {films.length} film{films.length > 1 ? "s" : ""}
              </Badge>
            </div>
            {list.description && <p className="text-muted-foreground text-sm max-w-xl">{list.description}</p>}

            <div className="flex items-center gap-2 mt-3">
              <div className="flex -space-x-2">
                {memberUsers.slice(0, 5).map((u) => (
                  <Avatar key={u.id} className="w-7 h-7 ring-2 ring-background">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {u.name?.slice(0, 2).toUpperCase() ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {memberUsers.length} {l === "fr" ? "membre" : "member"}{memberUsers.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {canEdit && (
            <div className="flex gap-2 shrink-0">
              <InviteButton listId={id} locale={l} />
            </div>
          )}
        </div>

        {/* Films grid */}
        {films.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border/50 rounded-xl">
            <Film className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground text-sm">
              {l === "fr"
                ? "Aucun film dans cette pelicule. Ajoute-en depuis une page film."
                : "No films yet. Add some from any film page."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {films.map((film) => {
              const poster = tmdbImage(film.posterPath, "w342");
              return (
                <div key={film.id} className="group relative">
                  <Link href={`/${l}/film/${film.tmdbId}`}>
                    <Card className="border-border/50 bg-card card-hover overflow-hidden h-full">
                      <div className="relative h-48">
                        {poster ? (
                          <Image src={poster} alt={film.title} fill className="object-cover" sizes="200px" />
                        ) : (
                          <div className="h-full flex items-center justify-center bg-muted">
                            <Film className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        {film.note && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <p className="text-xs text-white/80 line-clamp-2">{film.note}</p>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-2">
                        <p className="font-medium text-xs leading-tight line-clamp-2 group-hover:text-primary transition-colors">{film.title}</p>
                      </CardContent>
                    </Card>
                  </Link>
                  {canEdit && (
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <RemoveFilmButton listId={id} filmId={film.id} locale={l} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
