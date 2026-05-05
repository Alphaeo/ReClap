"use server";

import { revalidatePath } from "next/cache";
import { db } from "./db";
import { watchedFilms, watchlist } from "./db/schema";
import { and, eq } from "drizzle-orm";
import { getSession } from "./session";

export async function markWatched(data: {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  rating?: number;
  review?: string;
  runtime?: number;
  genres?: string[];
  releaseYear?: number;
}) {
  const session = await getSession();
  if (!session?.user) throw new Error("Not authenticated");

  const existing = await db.query.watchedFilms.findFirst({
    where: and(
      eq(watchedFilms.userId, session.user.id),
      eq(watchedFilms.tmdbId, data.tmdbId)
    ),
  });

  if (existing) {
    await db.update(watchedFilms)
      .set({
        rating: data.rating ?? existing.rating,
        review: data.review ?? existing.review,
        watchedAt: new Date(),
      })
      .where(eq(watchedFilms.id, existing.id));
  } else {
    await db.insert(watchedFilms).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      tmdbId: data.tmdbId,
      title: data.title,
      posterPath: data.posterPath,
      rating: data.rating,
      review: data.review,
      runtime: data.runtime,
      genres: data.genres ? JSON.stringify(data.genres) : null,
      releaseYear: data.releaseYear,
    });
  }

  revalidatePath(`/fr/film/${data.tmdbId}`);
  revalidatePath(`/en/film/${data.tmdbId}`);
  revalidatePath(`/fr/dashboard`);
  revalidatePath(`/en/dashboard`);
}

export async function removeWatched(tmdbId: number) {
  const session = await getSession();
  if (!session?.user) throw new Error("Not authenticated");

  await db.delete(watchedFilms).where(
    and(eq(watchedFilms.userId, session.user.id), eq(watchedFilms.tmdbId, tmdbId))
  );

  revalidatePath(`/fr/film/${tmdbId}`);
  revalidatePath(`/en/film/${tmdbId}`);
  revalidatePath(`/fr/dashboard`);
  revalidatePath(`/en/dashboard`);
}

export async function toggleWatchlist(data: {
  tmdbId: number;
  title: string;
  posterPath: string | null;
}) {
  const session = await getSession();
  if (!session?.user) throw new Error("Not authenticated");

  const existing = await db.query.watchlist.findFirst({
    where: and(
      eq(watchlist.userId, session.user.id),
      eq(watchlist.tmdbId, data.tmdbId)
    ),
  });

  if (existing) {
    await db.delete(watchlist).where(
      and(eq(watchlist.userId, session.user.id), eq(watchlist.tmdbId, data.tmdbId))
    );
  } else {
    await db.insert(watchlist).values({
      userId: session.user.id,
      tmdbId: data.tmdbId,
      title: data.title,
      posterPath: data.posterPath,
    });
  }

  revalidatePath(`/fr/film/${data.tmdbId}`);
  revalidatePath(`/en/film/${data.tmdbId}`);
}

export async function getFilmStatus(tmdbId: number) {
  const session = await getSession();
  if (!session?.user) return { watched: false, inWatchlist: false, watchedEntry: null };

  const [watchedEntry, watchlistEntry] = await Promise.all([
    db.query.watchedFilms.findFirst({
      where: and(eq(watchedFilms.userId, session.user.id), eq(watchedFilms.tmdbId, tmdbId)),
    }),
    db.query.watchlist.findFirst({
      where: and(eq(watchlist.userId, session.user.id), eq(watchlist.tmdbId, tmdbId)),
    }),
  ]);

  return {
    watched: !!watchedEntry,
    inWatchlist: !!watchlistEntry,
    watchedEntry: watchedEntry ?? null,
  };
}
