"use server";

import { revalidatePath } from "next/cache";
import { db } from "./db";
import { lists, listMembers, listFilms, listInvites, favorites } from "./db/schema";
import { and, eq } from "drizzle-orm";
import { getSession } from "./session";

// ─── Lists ───────────────────────────────────────────────────────────────────

export async function createList(data: { name: string; description?: string; isPublic?: boolean }) {
  const session = await getSession();
  if (!session?.user) throw new Error("Not authenticated");

  const id = crypto.randomUUID();
  await db.insert(lists).values({
    id,
    name: data.name,
    description: data.description,
    creatorId: session.user.id,
    isPublic: data.isPublic ?? true,
  });
  await db.insert(listMembers).values({
    listId: id,
    userId: session.user.id,
    role: "owner",
  });
  revalidatePath("/fr/pelicules");
  revalidatePath("/en/pelicules");
  return id;
}

export async function deleteList(listId: string) {
  const session = await getSession();
  if (!session?.user) throw new Error("Not authenticated");
  const [list] = await db.select().from(lists).where(eq(lists.id, listId)).limit(1);
  if (list.creatorId !== session.user.id) throw new Error("Forbidden");
  await db.delete(lists).where(eq(lists.id, listId));
  revalidatePath("/fr/pelicules");
  revalidatePath("/en/pelicules");
}

export async function addFilmToList(data: {
  listId: string;
  tmdbId: number;
  title: string;
  posterPath: string | null;
  note?: string;
}) {
  const session = await getSession();
  if (!session?.user) throw new Error("Not authenticated");

  const member = await db.query.listMembers.findFirst({
    where: and(eq(listMembers.listId, data.listId), eq(listMembers.userId, session.user.id)),
  });
  if (!member || member.role === "viewer") throw new Error("Forbidden");

  const existing = await db.query.listFilms.findFirst({
    where: and(eq(listFilms.listId, data.listId), eq(listFilms.tmdbId, data.tmdbId)),
  });
  if (existing) return;

  const films = await db.select().from(listFilms).where(eq(listFilms.listId, data.listId));
  await db.insert(listFilms).values({
    id: crypto.randomUUID(),
    listId: data.listId,
    tmdbId: data.tmdbId,
    title: data.title,
    posterPath: data.posterPath,
    addedBy: session.user.id,
    note: data.note,
    position: films.length,
  });

  await db.update(lists).set({ updatedAt: new Date() }).where(eq(lists.id, data.listId));
  revalidatePath(`/fr/pelicules/${data.listId}`);
  revalidatePath(`/en/pelicules/${data.listId}`);
}

export async function removeFilmFromList(listId: string, filmId: string) {
  const session = await getSession();
  if (!session?.user) throw new Error("Not authenticated");
  await db.delete(listFilms).where(and(eq(listFilms.id, filmId), eq(listFilms.listId, listId)));
  revalidatePath(`/fr/pelicules/${listId}`);
  revalidatePath(`/en/pelicules/${listId}`);
}

export async function createInviteLink(listId: string): Promise<string> {
  const session = await getSession();
  if (!session?.user) throw new Error("Not authenticated");

  const member = await db.query.listMembers.findFirst({
    where: and(eq(listMembers.listId, listId), eq(listMembers.userId, session.user.id)),
  });
  if (!member || member.role === "viewer") throw new Error("Forbidden");

  const token = crypto.randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.insert(listInvites).values({
    token,
    listId,
    createdBy: session.user.id,
    expiresAt,
  });

  return token;
}

export async function joinListByToken(token: string) {
  const session = await getSession();
  if (!session?.user) throw new Error("Not authenticated");

  const [invite] = await db.select().from(listInvites).where(eq(listInvites.token, token)).limit(1);
  if (!invite) throw new Error("Invalid invite");
  if (invite.expiresAt && invite.expiresAt < new Date()) throw new Error("Invite expired");

  const existing = await db.query.listMembers.findFirst({
    where: and(eq(listMembers.listId, invite.listId), eq(listMembers.userId, session.user.id)),
  });
  if (!existing) {
    await db.insert(listMembers).values({
      listId: invite.listId,
      userId: session.user.id,
      role: "editor",
    });
  }

  revalidatePath(`/fr/pelicules/${invite.listId}`);
  revalidatePath(`/en/pelicules/${invite.listId}`);
  return invite.listId;
}

// ─── Favorites ───────────────────────────────────────────────────────────────

export async function toggleFavorite(data: {
  type: "film" | "actor" | "director";
  tmdbId: number;
  name: string;
  imagePath?: string | null;
}) {
  const session = await getSession();
  if (!session?.user) throw new Error("Not authenticated");

  const existing = await db.query.favorites.findFirst({
    where: and(
      eq(favorites.userId, session.user.id),
      eq(favorites.type, data.type),
      eq(favorites.tmdbId, data.tmdbId)
    ),
  });

  if (existing) {
    await db.delete(favorites).where(
      and(
        eq(favorites.userId, session.user.id),
        eq(favorites.type, data.type),
        eq(favorites.tmdbId, data.tmdbId)
      )
    );
    return false;
  } else {
    await db.insert(favorites).values({
      userId: session.user.id,
      type: data.type,
      tmdbId: data.tmdbId,
      name: data.name,
      imagePath: data.imagePath,
    });
    return true;
  }
}

export async function getFavoriteStatus(type: string, tmdbId: number): Promise<boolean> {
  const session = await getSession();
  if (!session?.user) return false;
  const existing = await db.query.favorites.findFirst({
    where: and(
      eq(favorites.userId, session.user.id),
      eq(favorites.type, type),
      eq(favorites.tmdbId, tmdbId)
    ),
  });
  return !!existing;
}
