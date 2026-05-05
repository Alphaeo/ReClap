import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const statements = [
  `CREATE TABLE IF NOT EXISTS lists (
    id text PRIMARY KEY,
    name text NOT NULL,
    description text,
    creator_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_public boolean NOT NULL DEFAULT true,
    cover_poster_path text,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS list_members (
    list_id text NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
    user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'editor',
    joined_at timestamp NOT NULL DEFAULT now(),
    PRIMARY KEY (list_id, user_id)
  )`,
  `CREATE TABLE IF NOT EXISTS list_films (
    id text PRIMARY KEY,
    list_id text NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
    tmdb_id integer NOT NULL,
    title text NOT NULL,
    poster_path text,
    added_by text REFERENCES users(id) ON DELETE SET NULL,
    note text,
    position integer NOT NULL DEFAULT 0,
    added_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS list_invites (
    token text PRIMARY KEY,
    list_id text NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
    created_by text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at timestamp,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS favorites (
    user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type text NOT NULL,
    tmdb_id integer NOT NULL,
    name text NOT NULL,
    image_path text,
    added_at timestamp NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, type, tmdb_id)
  )`,
];

for (const s of statements) {
  await sql.query(s);
  console.log("✓", s.slice(7, 50).trim().split("\n")[0]);
}
console.log("\n✅ Migration 2 complete.");
