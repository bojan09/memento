import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";

// Minimal stand-ins for the parts of Supabase the migrations touch (auth, storage, roles),
// so every migration in supabase/migrations runs against real Postgres in-process.
const SUPABASE_STUB = `
create role anon; create role authenticated;
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create schema storage;
create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid default gen_random_uuid(), bucket_id text, name text);
create function storage.foldername(name text) returns text[] language sql as $$ select string_to_array(name, '/') $$;
alter table storage.objects enable row level security;
`;

const MIGRATIONS_DIR = join(process.cwd(), "supabase", "migrations");

export async function createDb() {
  const db = new PGlite();
  await db.exec(SUPABASE_STUB);
  for (const file of readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort()) {
    await db.exec(readFileSync(join(MIGRATIONS_DIR, file), "utf8"));
  }
  await db.exec(`
    grant usage on schema public to anon, authenticated;
    grant all on all tables in schema public to authenticated;
    grant execute on all functions in schema public to authenticated;
  `);

  // Run a query as a signed-in user (RLS applies), mirroring PostgREST's role switch.
  async function as<T = Record<string, unknown>>(userId: string, sql: string, params: unknown[] = []) {
    await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${userId}', false); set role authenticated;`);
    try {
      return (await db.query<T>(sql, params)).rows;
    } finally {
      await db.exec("reset role;");
    }
  }

  async function addUser(id: string) {
    await db.query("insert into auth.users (id) values ($1)", [id]);
  }

  return { db, as, addUser };
}
