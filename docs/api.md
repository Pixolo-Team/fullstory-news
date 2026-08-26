# Full Story — API Scope

Planned surface for `apps/backend` (NestJS). All routes are prefixed `/api`.
**Only `GET /api/health` exists today** — the rest is scope, not implementation.

Resources are named `article`, matching the database. The public URL stays
`/story/[slug]/[id]`. See the Terminology section in
[architecture.md](./architecture.md).

Public read endpoints are unauthenticated. Write endpoints require a Supabase
session.

## Authentication

| Method | Route          | Purpose                  |
| ------ | -------------- | ------------------------ |
| POST   | `/auth/login`  | Email + password sign in |
| POST   | `/auth/logout` | Clear session            |
| GET    | `/auth/me`     | Current author profile   |

## Categories

| Method | Route               | Auth | Purpose      |
| ------ | ------------------- | ---- | ------------ |
| GET    | `/categories`       | -    | List all     |
| GET    | `/categories/:slug` | -    | One Category |
| POST   | `/categories`       | yes  | Create       |
| PATCH  | `/categories/:id`   | yes  | Update       |
| DELETE | `/categories/:id`   | yes  | Delete       |

## Articles

| Method | Route                     | Auth | Purpose                             |
| ------ | ------------------------- | ---- | ----------------------------------- |
| GET    | `/articles`               | -    | List, filtered and paginated        |
| GET    | `/articles/:slug/:id`     | -    | One article (also records a view)   |
| GET    | `/articles/trending`      | -    | Top views over the last 7 days      |
| GET    | `/articles/latest`        | -    | Most recently published             |
| GET    | `/articles/by-category`   | -    | Latest 3-4 per Category, for Home   |
| GET    | `/articles/:id/similar`   | -    | Similar articles, for the Story page |
| POST   | `/articles`               | yes  | Create                              |
| PATCH  | `/articles/:id`           | yes  | Update, including publish/unpublish |
| DELETE | `/articles/:id`           | yes  | Delete                              |

`GET /articles` query parameters:

```text
category   category slug
sort       latest | trending
page       default 1
limit      default 20
status     draft | published   (admin only; public callers get published)
```

Notes:

- Unauthenticated callers must never receive drafts.
- Viewing an article inserts into `article_views` and increments
  `articles.view_count`. Trending reads `article_views` over a 7-day window; the
  two are not interchangeable.
- Similar articles for the MVP: same Category, excluding the current article,
  most recent first. Tag overlap can come later.

## Search

| Method | Route               | Purpose                                     |
| ------ | ------------------- | ------------------------------------------- |
| GET    | `/search?q=<query>` | Match headline, sub-headline, tags, content |

Paginated with the same `page` / `limit` parameters. Implementation is an open
decision — see [decisions.md](./decisions.md).

## Static pages

**No endpoints.** Privacy Policy, Terms & Conditions and Grievance are static
content in the frontend codebase, not database rows.

## Media

| Method | Route           | Auth | Purpose            |
| ------ | --------------- | ---- | ------------------ |
| POST   | `/upload/image` | yes  | Upload, return URL |

Returns a URL to store in `articles.hero_image_url` or inline in `content_html`.
The backing store is an open decision; keep it behind this one endpoint so it can
be swapped.

## Conventions

- Shared response shapes live in `packages/types`.
- List endpoints return `{ items, page, limit, total, totalPages }`.
- Timestamps are ISO-8601 UTC strings. The public site converts to the reader's
  local timezone in the browser.
