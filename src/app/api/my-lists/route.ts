import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { lists, listMembers, listFilms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json([], { status: 401 });

  const memberRows = await db.select({ listId: listMembers.listId, role: listMembers.role })
    .from(listMembers).where(eq(listMembers.userId, session.user.id));

  const result = await Promise.all(
    memberRows
      .filter((m) => m.role !== "viewer")
      .map(async ({ listId }) => {
        const [list] = await db.select().from(lists).where(eq(lists.id, listId)).limit(1);
        if (!list) return null;
        const films = await db.select({ id: listFilms.id }).from(listFilms).where(eq(listFilms.listId, listId));
        return { id: list.id, name: list.name, filmCount: films.length };
      })
  );

  return NextResponse.json(result.filter(Boolean));
}
