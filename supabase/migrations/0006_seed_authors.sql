-- Full Story - additional newsroom bylines
--
-- Seeded here rather than created through the admin, for the same reason the
-- default categories are seeded in 0001_init.sql: a fresh environment needs
-- them to exist before anything can be published. articles.author_id is NOT
-- NULL, so a Story cannot be written without a byline to attach it to.
--
-- user_id is left null deliberately. These are byline-only authors: they
-- identify who wrote a Story, not who can sign in to the admin. A Supabase
-- auth user is linked later, by the login flow, only if one of them is given
-- an account.

insert into authors (name, email) values
  ('Hussain Sunesara', 'hussain@fullstorynews.com'),
  ('Aditya Khilari', 'aditya@fullstorynews.com')
on conflict (email) do nothing;
