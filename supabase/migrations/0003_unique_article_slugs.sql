-- The public Story URL is dropping its id segment (/story/[slug]/[id] ->
-- /story/[slug]), so the slug alone must now resolve to exactly one article.
--
-- 0001_init.sql deliberately left slug non-unique, relying on the id to
-- disambiguate. That assumption no longer holds, so this:
--   1. Renames any existing duplicate slugs, oldest article keeps the
--      original, each later one gets a "-2", "-3", ... suffix.
--   2. Adds the unique constraint so a future collision fails loudly at
--      insert time instead of silently breaking the new URL shape.

do $$
declare
  duplicate record;
  suffixed_slug text;
  suffix int;
begin
  for duplicate in (
    select id
    from (
      select
        id,
        slug,
        row_number() over (partition by slug order by created_at, id) as slug_rank
      from articles
    ) ranked
    where slug_rank > 1
    order by slug_rank
  )
  loop
    select slug into suffixed_slug from articles where id = duplicate.id;
    suffix := 2;

    while exists (select 1 from articles where slug = suffixed_slug || '-' || suffix) loop
      suffix := suffix + 1;
    end loop;

    update articles set slug = suffixed_slug || '-' || suffix where id = duplicate.id;
  end loop;
end $$;

alter table articles add constraint articles_slug_key unique (slug);
