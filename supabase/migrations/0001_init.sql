-- Full Story - initial schema
-- Source of truth: docs/database.md
--
-- Naming: the database says "article". The public UI says "Story".
-- Static page content is NOT stored here - it lives in the frontend codebase.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'article_status') then
    create type article_status as enum ('draft', 'published');
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. authors
-- ---------------------------------------------------------------------------

create table if not exists authors (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users (id) on delete set null,
  name        text not null,
  email       text not null unique,
  avatar_url  text,
  bio         text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists authors_user_id_idx on authors (user_id);

drop trigger if exists authors_set_updated_at on authors;
create trigger authors_set_updated_at
  before update on authors
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. categories
-- ---------------------------------------------------------------------------

create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  slug        text not null unique,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists categories_set_updated_at on categories;
create trigger categories_set_updated_at
  before update on categories
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. articles
-- ---------------------------------------------------------------------------
--
-- slug is deliberately NOT unique. The public URL is /story/[slug]/[id], so the
-- id disambiguates and two articles may legitimately share a slug.
--
-- category_id uses ON DELETE RESTRICT: deleting a category that still has
-- articles must be blocked, never cascaded. Every article requires a category.

create table if not exists articles (
  id              uuid primary key default gen_random_uuid(),
  headline        text not null,
  sub_headline    text,
  slug            text not null,
  category_id     uuid not null references categories (id) on delete restrict,
  author_id       uuid not null references authors (id) on delete restrict,
  hero_image_url  text,
  content_html    text not null default '',
  tags            text[] not null default '{}',
  status          article_status not null default 'draft',
  view_count      bigint not null default 0,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- A published article must have a publication date, and a draft must not.
  constraint articles_published_at_matches_status check (
    (status = 'published' and published_at is not null)
    or (status = 'draft' and published_at is null)
  )
);

create index if not exists articles_slug_idx on articles (slug);
create index if not exists articles_category_id_idx on articles (category_id);
create index if not exists articles_author_id_idx on articles (author_id);
create index if not exists articles_tags_idx on articles using gin (tags);

-- Serves the Latest feed and every public listing: published only, newest first.
create index if not exists articles_published_idx
  on articles (published_at desc)
  where status = 'published';

drop trigger if exists articles_set_updated_at on articles;
create trigger articles_set_updated_at
  before update on articles
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. article_views
-- ---------------------------------------------------------------------------
--
-- One row per view. Trending is computed from these over a rolling 7 days.
-- articles.view_count is the lifetime counter and cannot be windowed, so the
-- two are not interchangeable.

create table if not exists article_views (
  id          uuid primary key default gen_random_uuid(),
  article_id  uuid not null references articles (id) on delete cascade,
  viewed_at   timestamptz not null default now()
);

-- Composite index ordered for the trending query: filter by time, group by article.
create index if not exists article_views_viewed_at_idx
  on article_views (viewed_at desc, article_id);

create index if not exists article_views_article_id_idx on article_views (article_id);

-- ---------------------------------------------------------------------------
-- 5. article_instagram_post
-- ---------------------------------------------------------------------------
--
-- Manually attached Instagram URLs. No API sync.

create table if not exists article_instagram_post (
  id             uuid primary key default gen_random_uuid(),
  article_id     uuid not null references articles (id) on delete cascade,
  instagram_url  text not null,
  sort_order     int not null default 0,
  created_at     timestamptz not null default now()
);

create index if not exists article_instagram_post_article_id_idx
  on article_instagram_post (article_id, sort_order);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
--
-- The backend holds the secret key, which bypasses RLS entirely, so these
-- policies do not constrain the API. They are defence in depth: if the
-- publishable key ever reaches a browser and is pointed at Supabase directly,
-- a draft must still not be readable.
--
-- Default posture is deny. Only published content is exposed to anon.

alter table authors enable row level security;
alter table categories enable row level security;
alter table articles enable row level security;
alter table article_views enable row level security;
alter table article_instagram_post enable row level security;

-- Categories are public: they drive navigation on every page.
drop policy if exists categories_public_read on categories;
create policy categories_public_read
  on categories for select
  to anon, authenticated
  using (true);

-- Authors are public, but only the byline fields are ever selected by clients.
drop policy if exists authors_public_read on authors;
create policy authors_public_read
  on authors for select
  to anon, authenticated
  using (true);

-- Published articles only. Drafts are invisible without the secret key.
drop policy if exists articles_public_read_published on articles;
create policy articles_public_read_published
  on articles for select
  to anon, authenticated
  using (status = 'published');

-- Instagram posts are readable only for articles that are themselves published.
drop policy if exists article_instagram_post_public_read on article_instagram_post;
create policy article_instagram_post_public_read
  on article_instagram_post for select
  to anon, authenticated
  using (
    exists (
      select 1 from articles
      where articles.id = article_instagram_post.article_id
        and articles.status = 'published'
    )
  );

-- article_views has no anon policy at all. View counting happens server-side
-- through the backend, so nothing else may read or write this table.

-- ---------------------------------------------------------------------------
-- Seed: default categories
-- ---------------------------------------------------------------------------

insert into categories (name, slug) values
  ('World', 'world'),
  ('Tech', 'tech'),
  ('Politics', 'politics'),
  ('Sports', 'sports')
on conflict (slug) do nothing;
