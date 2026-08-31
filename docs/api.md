# Full Story — API

Base path: `/api`. All requests and responses are `application/json` unless
stated otherwise. Timestamps are ISO-8601 UTC.

Resources are named `article`. The public URL is `/story/[slug]/[id]`.

---

## Frontend route map

This section is the contract for the Astro public site in `apps/frontend`.
It maps each reader-facing route to the backend endpoints it depends on.

| Frontend route | Page | API dependency |
|---|---|---|
| `/` | Home | `GET /categories`, `GET /articles/trending`, `GET /articles/latest`, `GET /articles/by-category` |
| `/[category]` | Category listing | `GET /categories/:slug`, `GET /articles?category=<slug>&page=<n>&limit=<n>` |
| `/story/[slug]/[id]` | Story | `GET /articles/:slug/:id`, `GET /articles/:id/similar`, `GET /categories` |
| `/search` | Search | `GET /search?q=<query>&page=<n>&limit=<n>`, `GET /categories` |
| `/privacy-policy` | Static page | no API |
| `/terms` | Static page | no API |
| `/grievance` | Static page | no API |

Reader-facing pages never require auth. Drafts must never appear in any public
frontend response.

### Astro page notes

- Header on every public page needs `GET /categories` for category navigation.
- The local-time clock in the header is computed in the browser, not returned by the API.
- Footer category links can reuse the same `GET /categories` response as the header.
- Empty frontend sections are omitted rather than rendered with empty headings.
- Search is request-time. If Astro remains static-first, the search UI needs a
  client fetch against `GET /search`.

---

## Conventions

### Headers

| Header | Value | When |
|---|---|---|
| `Content-Type` | `application/json` | All requests with a body |
| `Content-Type` | `multipart/form-data` | `POST /upload/image` only |
| `Cookie` | `fs_session=<httpOnly>` | All authenticated requests |

Auth is an httpOnly session cookie set by `POST /auth/login`. No bearer tokens.

**Only `/auth/*` requires a session.** Every other endpoint is open, including
writes. Access to the admin is gated by the admin app, which validates the
session before rendering any dashboard route — see decisions.md #18 for what
that does and does not protect.

### Response envelope

```json
{
  "data": null,
  "status": "success",
  "status_code": 200,
  "message": "Request completed successfully",
  "error": null
}
```

`data` is null on error. `error` is null on success.

### Pagination

List endpoints return inside `data`:

```json
{ "items": [], "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
```

| Param | Type | Default | Max |
|---|---|---|---|
| `page` | int | 1 | — |
| `limit` | int | 20 | 100 |

### Errors

| Code | Meaning |
|---|---|
| 400 | Malformed request |
| 401 | No session, or session expired |
| 403 | Authenticated but not permitted |
| 404 | Resource does not exist |
| 409 | Conflict — duplicate slug, or category still in use |
| 413 | Upload exceeds 5 MB |
| 415 | Unsupported media type |
| 422 | Validation failed |
| 500 | Unexpected |
| 503 | Supabase unreachable |

---

## 1. Auth

### `POST /auth/login`

Auth: none.

```json
{ "email": "editor@example.com", "password": "string" }
```

Response `data`:

```json
{ "id": "uuid", "name": "Amina Khan", "email": "editor@example.com", "avatarUrl": null }
```

Sets `fs_session` httpOnly cookie.

Errors: `401` invalid credentials, `422` missing field.

### `POST /auth/logout`

Auth: session. No body. Clears the cookie. Returns `204`.

### `GET /auth/me`

Auth: session.

Response `data`: same shape as login.

Errors: `401`.

---

## 2. Categories

### `GET /categories`

Auth: none.

Response `data`:

```json
[{ "id": "uuid", "name": "World", "slug": "world" }]
```

Frontend use:
- Header category navigation on every public page
- Footer category links
- Optional category context on Story and Search layouts

### `GET /categories/:slug`

Auth: none.

Response `data`: single category object.

Errors: `404`.

Frontend use:
- Validates the Category page route
- Supplies the page heading for `/[category]`

### `GET /admin/categories`

Auth: none.

Response `data`:

```json
[{ "id": "uuid", "name": "World", "slug": "world",
   "articleCount": 12, "createdAt": "...", "updatedAt": "..." }]
```

### `POST /categories`

Auth: none.

```json
{ "name": "World", "slug": "world" }
```

`slug` optional — generated from `name` when omitted.

Response `data`: created category. Status `201`.

Errors: `409` duplicate name or slug, `422` empty name.

### `PATCH /categories/:id`

Auth: none. Body: any subset of `POST`.

Errors: `404`, `409`, `422`.

### `DELETE /categories/:id`

Auth: none. Returns `204`.

Errors: `404`, `409` when articles reference it —

```json
{ "data": null, "status": "error", "status_code": 409,
  "message": "Category has 12 articles", "error": "CATEGORY_IN_USE" }
```

---

## 3. Articles

### `GET /articles`

Auth: none. Session unlocks `status` and `q`.

| Param | Type | Values |
|---|---|---|
| `category` | string | category slug |
| `sort` | string | `latest` \| `published` \| `views` |
| `status` | string | `draft` \| `published` \| `all` |
| `q` | string | matches headline, sub-headline |
| `page` | int | | — |
| `limit` | int | | — |

`status` is honoured as sent; omitting it returns published only.

Response `data`: paginated `items` of —

```json
{
  "id": "uuid",
  "headline": "string",
  "subHeadline": "string | null",
  "slug": "string",
  "status": "published",
  "heroImageUrl": "string | null",
  "tags": ["string"],
  "viewCount": 14280,
  "category": { "id": "uuid", "name": "Politics", "slug": "politics" },
  "author": { "id": "uuid", "name": "Amina Khan" },
  "publishedAt": "2026-08-27T16:30:00.000Z",
  "updatedAt": "2026-08-27T18:10:00.000Z"
}
```

`contentHtml` is not returned by list endpoints.

Frontend use:
- Category listing page: `GET /articles?category=<slug>&page=<n>&limit=<n>`
- Public lists only use published content
- Category listings show newest first unless a different public sort is later approved

### `GET /articles/trending`

Auth: none. Top `view_count` over the last 7 days, from `article_views`.

| Param | Type | Default |
|---|---|---|
| `limit` | int | 3 |

Response `data`: array of article list objects.

Frontend use:
- Home page `Trending Stories`
- Default count is `3` to match the wireframe

### `GET /articles/latest`

Auth: none. Published, newest first.

| Param | Type | Default |
|---|---|---|
| `limit` | int | 10 |

Frontend use:
- Home page `Latest Stories`
- Default count is `10`, which fits the planned 8-10 item range

### `GET /articles/by-category`

Auth: none. Latest per category, for the home page.

| Param | Type | Default |
|---|---|---|
| `limit` | int | 4 |

Response `data`:

```json
[{ "category": { "id": "uuid", "name": "World", "slug": "world" },
   "items": [] }]
```

Categories with no published articles are omitted.

Frontend use:
- Home page per-category sections
- `items` should contain the same article list shape as other listing endpoints
- Category order should follow the category source order, with empty categories omitted

### `GET /articles/:slug/:id`

Auth: none. Published only. Records a view.

Response `data`: full article —

```json
{
  "id": "uuid",
  "headline": "string",
  "subHeadline": "string | null",
  "slug": "string",
  "status": "published",
  "heroImageUrl": "string | null",
  "contentHtml": "<p>...</p>",
  "tags": ["string"],
  "viewCount": 14280,
  "category": { "id": "uuid", "name": "Politics", "slug": "politics" },
  "author": { "id": "uuid", "name": "Amina Khan", "avatarUrl": null },
  "instagramPosts": [{ "id": "uuid", "instagramUrl": "https://...", "sortOrder": 0 }],
  "publishedAt": "...",
  "createdAt": "...",
  "updatedAt": "..."
}
```

Errors: `404`.

Frontend use:
- Main Story page payload
- Must include enough data to render category label, byline, hero image, tags,
  article body, and related Instagram URLs in one request
- This request records a view and therefore must not be used for admin editing

### `GET /articles/:id/similar`

Auth: none. Same category, excludes the current article, newest first.

| Param | Type | Default |
|---|---|---|
| `limit` | int | 3 |

Response `data`: array of article list objects.

Frontend use:
- `Similar Stories` section on the Story page
- Omit the whole section when the response is empty

### `GET /articles/:id`

Auth: none. Drafts included. Does **not** record a view.

Response `data`: full article.

Errors: `401`, `404`.

### `POST /articles`

Auth: none. `authorId` is not accepted — the server attributes the Story to
the default author, since there is no session to read one from.

```json
{
  "headline": "string",
  "subHeadline": "string | null",
  "slug": "string",
  "categoryId": "uuid",
  "heroImageUrl": "string | null",
  "contentHtml": "<p>...</p>",
  "tags": ["string"]
}
```

| Field | Required | Notes |
|---|---|---|
| `headline` | yes | |
| `categoryId` | yes | must exist |
| `slug` | no | generated from `headline` when omitted |
| `contentHtml` | no | sanitised on write |
| `tags` | no | defaults `[]` |

`authorId` and `status` are not accepted. Author comes from the session; every
article is created as a draft.

Response `data`: created article. Status `201`.

Errors: `401`, `422` invalid `categoryId` or missing `headline`.

### `PATCH /articles/:id`

Auth: none. Any subset of `POST` fields, plus:

```json
{ "status": "draft | published" }
```

`published_at` is set on the first transition to `published` and never
overwritten.

Errors: `401`, `404`, `422`.

### `DELETE /articles/:id`

Auth: none. Returns `204`. Cascades to `article_views` and
`article_instagram_post`.

Errors: `401`, `404`.

### `PUT /articles/:id/instagram`

Auth: none. Replaces the full ordered list. Array position is `sort_order`.

```json
{ "urls": ["https://instagram.com/p/aaa", "https://instagram.com/p/bbb"] }
```

Response `data`: array of stored posts.

Errors: `401`, `404`, `422` malformed URL.

---

## 4. Search

### `GET /search`

Auth: none. Published only.

| Param | Type | Required |
|---|---|---|
| `q` | string | yes |
| `page` | int | no |
| `limit` | int | no |

Matches headline, sub-headline, tags, `content_html`.

Response `data`: paginated `items` of article list objects.

Errors: `422` missing `q`.

Frontend use:
- `/search` page when the query is present
- No-query state renders the search input only
- No-results state renders a plain text empty state, not suggestions or fallback content

---

## 5. Media

### `POST /upload/image`

Auth: none. `Content-Type: multipart/form-data`.

| Field | Type |
|---|---|
| `file` | binary |

Limits: 5 MB. `image/jpeg`, `image/png`, `image/webp`.

Response `data`:

```json
{ "url": "https://<project>.supabase.co/storage/v1/object/public/..." }
```

Errors: `401`, `413` too large, `415` unsupported type.

---

## 6. Dashboard

### `GET /admin/stats`

Auth: none.

Response `data`:

```json
{ "totalArticles": 24, "publishedArticles": 18, "draftArticles": 6, "totalCategories": 4 }
```

---

## 7. Health

### `GET /health`

Auth: none.

```json
{ "status": "ok", "service": "full-story-api", "uptimeSeconds": 1240,
  "dependencies": [{ "name": "supabase", "reachable": true, "latencyMs": 12 }] }
```

`status` is `degraded` when any dependency is unreachable.

---

## Not implemented

No endpoints for static pages. Privacy Policy, Terms and Grievance are static
content in `apps/frontend`.
