-- Related-video cards on a Story page were showing a random stock photo as
-- the thumbnail, unrelated to the actual reel - that was always a
-- placeholder standing in for a real thumbnail this table had no column for.
--
-- The real thumbnail is fetched once, server-side, when the URL is saved
-- (Instagram's public og:image tag on the post page), not on every read -
-- that page takes ~2.5s to fetch, far too slow to do per pageview.

alter table article_instagram_post
  add column if not exists thumbnail_url text;
