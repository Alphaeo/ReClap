import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { NavBar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { lists, listMembers, listFilms } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { tmdbImage } from "@/lib/tmdb";
import { Plus, Film, Users, Lock, Globe } from "lucide-react";
import { CreateListButton } from "./create-list-button";

type Locale = "fr" | "en";

export default async function PeliculesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (locale as Locale) ?? "fr";
  const session = await getSession();
  if (!session?.user) redirect(`/${l}/auth/signin`);

  // Get all lists where user is a member
  const memberRows = await db.select({ listId: listMembers.listId }).from(listMembers)
    .where(eq(listMembers.userId, session.user.id));
  const listIds = memberRows.map((r) => r.listId);

  const userLists = listIds.length > 0
    ? await Promise.all(listIds.map(async (id) => {
        const [list] = await db.select().from(lists).where(eq(lists.id, id)).limit(1);
        if (!list) return null;
        const films = await db.select().from(listFilms).where(eq(listFilms.listId, id));
        const members = await db.select().from(listMembers).where(eq(listMembers.listId, id));
        const [myMember] = members.filter((m) => m.userId === session.user.id);
        return { ...list, filmCount: films.length, memberCount: members.length, myRole: myMember?.role, coverPoster: films[0]?.posterPath ?? null };
      })).then((r) => r.filter(Boolean))
    : [];

  userLists.sort((a, b) => new Date(b!.updatedAt).getTime() - new Date(a!.updatedAt).getTime());

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar locale={l} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-24 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Pelicules</h1>
            <p className="text-muted-foreground text-sm">
              {l === "fr" ? "Tes listes collaboratives de films" : "Your collaborative film lists"}
            </p>
          </div>
          <CreateListButton locale={l} />
        </div>

        {userLists.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Film className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {l === "fr" ? "Aucune pelicule pour l'instant" : "No pelicules yet"}
            </h2>
            <p className="text-muted-foreground mb-6 text-sm max-w-sm mx-auto">
              {l === "fr"
                ? "Crée ta première liste collaborative et invite tes amis à y ajouter des films."
                : "Create your first collaborative list and invite friends to add films."}
            </p>
            <CreateListButton locale={l} />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userLists.map((list) => {
              if (!list) return null;
              const cover = tmdbImage(list.coverPoster, "w342");
              return (
                <Link key={list.id} href={`/${l}/pelicules/${list.id}`}>
                  <Card className="border-border/50 bg-card card-hover cursor-pointer overflow-hidden group h-full">
                    <div className="h-36 relative bg-muted overflow-hidden">
                      {cover ? (
                        <Image src={cover} alt={list.name} fill className="object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-10 h-10 text-white/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="font-bold text-white text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                          {list.name}
                        </h3>
                      </div>
                      <div className="absolute top-2 right-2">
                        {list.isPublic
                          ? <Globe className="w-3.5 h-3.5 text-white/60" />
                          : <Lock className="w-3.5 h-3.5 text-white/60" />}
                      </div>
                    </div>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Film className="w-3 h-3" />{list.filmCount}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{list.memberCount}</span>
                      </div>
                      {list.myRole === "owner" && (
                        <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                          {l === "fr" ? "Créateur" : "Owner"}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
