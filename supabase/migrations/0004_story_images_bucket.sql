-- The image upload endpoint (POST /upload/image) has existed since the
-- backend's media module was built, but no Storage bucket for it was ever
-- created - on this project or, most likely, on production either, since
-- every upload failed with a generic "Failed to upload the image" and the
-- feature had apparently never been exercised end-to-end before now.
--
-- Public: uploaded URLs are embedded directly as <img src> on the public
-- site with no auth in front of them, same as any other Story asset.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'story-images',
  'story-images',
  true,
  5242880, -- 5 MB, matching MAX_IMAGE_SIZE_BYTES in media.constants.ts
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;
