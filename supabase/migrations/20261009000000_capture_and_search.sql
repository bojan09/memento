-- Memento P1: no AI for now.
-- 1. Drop AI-only fields (provenance, confidence, summary, full article text).
-- 2. Add link preview fields filled from the page's own metadata (title, description, image).
-- 3. Rebuild the keyword index and add a prefix-matching search function.

-- ---------- drop AI-only fields ----------
alter table public.memories drop column search_tsv; -- depends on summary/content_text; rebuilt below
alter table public.memories drop constraint memories_why_source;
alter table public.memories
  drop column why_source,
  drop column why_confidence,
  drop column summary,
  drop column content_text;

alter table public.projects drop column source;

alter table public.memory_tags
  drop column source,
  drop column accepted,
  drop column confidence;

drop type public.provenance;
drop type public.confidence;

-- ---------- link preview fields ----------
alter table public.memories
  add column description text check (description is null or char_length(description) <= 1000),
  add column image_url text check (image_url is null or (char_length(image_url) <= 2048 and image_url ~* '^https?://'));

alter table public.memories
  add constraint memories_url_length check (url is null or char_length(url) <= 2048);

-- ---------- keyword search ----------
alter table public.memories add column search_tsv tsvector generated always as (
  setweight(to_tsvector('simple', coalesce(title, '')), 'A')
  || setweight(to_tsvector('simple', coalesce(note, '') || ' ' || coalesce(why, '')), 'B')
  || setweight(to_tsvector('simple', coalesce(description, '') || ' ' || coalesce(site_name, '') || ' ' || coalesce(url, '')), 'C')
  -- Host without "www.", whole and split on dots, so "figma.com" and "figma" both match.
  || setweight(to_tsvector('simple', coalesce(
       regexp_replace(url, '^https?://(www\.)?([^/:?#]+).*$', '\2 ') || translate(regexp_replace(url, '^https?://(www\.)?([^/:?#]+).*$', '\2'), '.', ' '),
       '')), 'C')
) stored;
create index memories_search_idx on public.memories using gin (search_tsv);

-- Search-as-you-type: every word is a prefix ("fig mult" finds "Figma multiplayer").
-- Each word is passed as a quoted lexeme, so user input can never inject tsquery operators.
-- security invoker: RLS still limits results to the caller's own memories.
create function public.search_memories(q text, max_results integer default 20)
returns setof public.memories
language sql
stable
security invoker
set search_path = ''
as $$
  with words as (
    select w
    -- Backslashes would make quote_literal emit E'' strings, which tsquery can't parse.
    from regexp_split_to_table(lower(replace(coalesce(q, ''), E'\\', ' ')), '[[:space:]]+') as w
    where w <> ''
    limit 8
  ),
  query as (
    select to_tsquery('simple', string_agg(quote_literal(w) || ':*', ' & ')) as tsq
    from words
  )
  select m.*
  from public.memories m, query
  where query.tsq is not null
    and m.search_tsv @@ query.tsq
  order by ts_rank(m.search_tsv, query.tsq) desc, m.created_at desc
  limit least(greatest(coalesce(max_results, 20), 1), 50);
$$;

revoke execute on function public.search_memories(text, integer) from public;
grant execute on function public.search_memories(text, integer) to authenticated;
