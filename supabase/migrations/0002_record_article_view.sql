-- Records a Story view atomically.
--
-- The insert into article_views and the increment of articles.view_count must
-- happen together: a function body is a single transaction, so either both
-- land or neither does. The counter is incremented in SQL rather than read and
-- written back by the application, so concurrent readers of the same Story
-- cannot overwrite each other's increment.

create or replace function record_article_view(target_article_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into article_views (article_id) values (target_article_id);

  update articles
     set view_count = view_count + 1
   where id = target_article_id;
end;
$$;

revoke all on function record_article_view(uuid) from public, anon;
grant execute on function record_article_view(uuid) to service_role;
