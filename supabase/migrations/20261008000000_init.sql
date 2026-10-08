-- Memento P0 schema: memories, projects, tags. Single user today, but every row carries user_id
-- and is guarded by RLS so the app can open to more people without a data migration.
-- Chunks + embeddings (pgvector) arrive in the P3 migration, once the embedding model is fixed.

-- ---------- types ----------
create type public.memory_kind as enum ('link', 'note', 'image');
create type public.memory_status as enum ('pending', 'processing', 'ready', 'failed');
create type public.provenance as enum ('user', 'ai');
create type public.confidence as enum ('low', 'medium', 'high');

-- ---------- helpers ----------
create function public.set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------- projects ----------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  source public.provenance not null default 'user',
  created_at timestamptz not null default now(),
  unique (id, user_id)
);
create unique index projects_user_name_key on public.projects (user_id, lower(name));

-- ---------- memories ----------
create table public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind public.memory_kind not null,
  status public.memory_status not null default 'pending',

  -- What the user gave us
  url text check (url is null or url ~* '^https?://'),
  note text check (note is null or char_length(note) <= 20000),
  image_path text,
  why text check (why is null or char_length(why) <= 500),
  why_source public.provenance,
  why_confidence public.confidence,

  -- What processing produced (P2)
  title text check (title is null or char_length(title) <= 300),
  site_name text,
  summary text,
  content_text text,
  error text,

  project_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  processed_at timestamptz,

  unique (id, user_id),
  foreign key (project_id, user_id) references public.projects (id, user_id) on delete set null (project_id),
  constraint memories_kind_payload check (
    (kind = 'link' and url is not null)
    or (kind = 'note' and note is not null)
    or (kind = 'image' and image_path is not null)
  ),
  constraint memories_why_source check ((why is null) = (why_source is null))
);

-- Keyword search. 'simple' config: no English-only stemming, so Macedonian and mixed text work too.
alter table public.memories add column search_tsv tsvector generated always as (
  setweight(to_tsvector('simple', coalesce(title, '')), 'A')
  || setweight(to_tsvector('simple', coalesce(note, '') || ' ' || coalesce(why, '')), 'B')
  || setweight(to_tsvector('simple', coalesce(summary, '')), 'C')
  || setweight(to_tsvector('simple', left(coalesce(content_text, ''), 100000)), 'D')
) stored;

create index memories_user_created_idx on public.memories (user_id, created_at desc);
create index memories_project_idx on public.memories (project_id) where project_id is not null;
create index memories_status_idx on public.memories (status) where status in ('pending', 'processing', 'failed');
create index memories_search_idx on public.memories using gin (search_tsv);

create trigger memories_set_updated_at before update on public.memories
  for each row execute function public.set_updated_at();

-- ---------- tags ----------
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 40),
  created_at timestamptz not null default now(),
  unique (id, user_id)
);
create unique index tags_user_name_key on public.tags (user_id, lower(name));

create table public.memory_tags (
  memory_id uuid not null,
  tag_id uuid not null,
  user_id uuid not null default auth.uid(),
  source public.provenance not null default 'user',
  -- AI tags stay "suggested" (dashed, amber dot) until the user accepts them.
  accepted boolean not null default true,
  confidence public.confidence,
  created_at timestamptz not null default now(),
  primary key (memory_id, tag_id),
  foreign key (memory_id, user_id) references public.memories (id, user_id) on delete cascade,
  foreign key (tag_id, user_id) references public.tags (id, user_id) on delete cascade
);
create index memory_tags_tag_idx on public.memory_tags (tag_id);

-- ---------- row level security ----------
alter table public.projects enable row level security;
alter table public.memories enable row level security;
alter table public.tags enable row level security;
alter table public.memory_tags enable row level security;

create policy "own projects" on public.projects for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own memories" on public.memories for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own tags" on public.tags for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own memory tags" on public.memory_tags for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- ---------- storage: private bucket, one folder per user ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('captures', 'captures', false, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/heic']);

create policy "own capture files" on storage.objects for all to authenticated
  using (bucket_id = 'captures' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'captures' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ---------- keep-alive ----------
-- Called daily by Vercel Cron so the free project isn't paused for inactivity. Returns nothing sensitive.
create function public.keepalive() returns integer
language sql
stable
security invoker
set search_path = ''
as $$ select 1 $$;

revoke execute on function public.keepalive() from public;
grant execute on function public.keepalive() to anon, authenticated;
