import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { watchedFilms } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, date } = await req.json();
  if (!title) return NextResponse.json({ error: "Missing title" }, { status: 400 });

  // Search TMDB
  const tmdbRes = await fetch(
    `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&language=fr-FR`,
    { headers: { Authorization: `Bearer ${process.env.TMDB_API_READ_TOKEN}` } }
  );

  if (!tmdbRes.ok) return NextResponse.json({ error: "TMDB error" }, { status: 500 });
  const tmdbData = await tmdbRes.json();
  const movie = tmdbData.results?.[0];
  if (!movie) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Check if already in watched
  const existing = await db.query.watchedFilms.findFirst({
    where: and(eq(watchedFilms.userId, session.user.id), eq(watchedFilms.tmdbId, movie.id)),
  });
  if (existing) return NextResponse.json({ ok: true, skipped: true });

  // Parse date
  let watchedAt = new Date();
  try { watchedAt = new Date(date); } catch { /* use now */ }

  await db.insert(watchedFilms).values({
    id: crypto.randomUUID(),
    userId: session.user.id,
    tmdbId: movie.id,
    title: movie.title,
    posterPath: movie.poster_path,
    releaseYear: movie.release_date ? Number(movie.release_date.slice(0, 4)) : null,
    watchedAt,
  });

  return NextResponse.json({ ok: true, title: movie.title });
}
