# Full Story — Architecture

## Objective

Full Story is a journalism client that currently publishes only on Instagram.
This is their first website: an MVP built to launch quickly and be evaluated
before the product is expanded.

The client's USP is **simplicity** — simple language, easy-to-read Stories, clean
interfaces, minimal clutter. The architecture should reflect that. Prefer
`simple > clever`, `clear > abstract`, `required > speculative`.

## Terminology

The reader-facing unit of content is a **Story**. The database and backend code
call it an **article**. Both are deliberate:

| Layer | Term | Example |
| ----- | ---- | ------- |
| Public UI text | **Story** | "Trending Stories", "Similar Stories" |
| Public URL | `story` | `/story/[slug]/[id]` |
| Database | `article` | `articles`, `article_views`, `article_instagram_post` |
| Backend code, shared types | `Article` | `Article`, `ArticleStatus` |

Never use "News" as primary UI terminology. The public URL keeps `story` because
it is a contract with search engines and with anyone who has shared a link.

## Repository layout

```text
full-story/
├── apps/
│   ├── admin/        Next.js  — admin panel for managing Stories
│   ├── backend/      NestJS   — REST API
│   └── frontend/     Astro    — public website
├── packages/
│   └── types/        shared domain types (Article, Category, Author, ...)
├── docs/
│   ├── architecture.md
│   ├── database.md
│   ├── decisions.md
│   ├── api.md
└── README.md
```

pnpm workspaces, no build orchestrator. Each app is independently runnable; a
task runner can be added if builds get slow enough to justify it.

## Applications

### apps/frontend — Astro

The public website. Content-heavy, read-mostly and SEO-sensitive, which is what
Astro is built for: static HTML by default, JavaScript only where a component
genuinely needs it (the local-time clock in the header, share buttons, search).

Routes:

| Route                | Page               | Source                |
| -------------------- | ------------------ | --------------------- |
| `/`                  | Home               | API                   |
| `/[category]`        | Category listing   | API                   |
| `/story/[slug]/[id]` | Story              | API                   |
| `/search`            | Search             | API                   |
| `/privacy-policy`    | Privacy Policy     | static, in this repo  |
| `/terms`             | Terms & Conditions | static, in this repo  |
| `/grievance`         | Grievance          | static, in this repo  |

### apps/admin — Next.js

Internal tool, never indexed. Login (Supabase Auth, email + password), Stories
CRUD with draft/publish, and Categories CRUD. One admin user for the MVP.

Kept as a separate app from the public site because its needs are opposite:
heavily interactive, React-first, behind auth, and with no SEO or
static-generation requirement.

The admin does **not** manage static pages — that content lives in the frontend
codebase. See [decisions.md](./decisions.md#5-static-page-content--decided-in-the-codebase).

### apps/backend — NestJS

REST API over Supabase Postgres. Owns validation, publishing rules, view counting
and trending calculation, so that logic is not duplicated between the admin and
the public site. Planned surface is in [api.md](./api.md); only a health endpoint
exists today.

## Data flow

```text
Admin (Next.js) ──write──▶ Backend (NestJS) ──▶ Supabase Postgres
                                                       │
Public site (Astro) ──read──▶ Backend (NestJS) ────────┘

Supabase Auth ──session──▶ Admin
```

The public site reads through the API rather than talking to Supabase directly,
so the Supabase secret key never leaves the server and read shaping (trending,
similar Stories, search) lives in one place.

## Database and auth

Supabase provides Postgres, Auth and — pending confirmation — image storage.
Schema is documented in [database.md](./database.md): five tables, no more than
the MVP needs.

Static page content is **not** in the database.

## Design direction

Typography, readability, white space, clear hierarchy, simple grids, minimal
decoration. The Story is the visual focus. The public site should not look like a
fintech dashboard, a SaaS app, or a dense enterprise portal.

Client branding has not arrived. Until it does, both apps use neutral placeholder
tokens defined in one file per app (`apps/frontend/src/styles/global.css`,
`apps/admin/src/app/globals.css`). Components reference tokens; they must not
hard-code colours or fonts.

## Deployment

- **Frontend (Astro)** → Vercel
- **Admin (Next.js)** → Vercel
- **Backend (NestJS)** → open. NestJS is a long-lived process and does not map
  cleanly onto Vercel's serverless model. A container host (Railway, Render,
  Fly.io) is likely a better fit. See [decisions.md](./decisions.md).

## Out of scope for the MVP

Reader accounts, multiple admin roles, permissions, comments, likes, reactions,
bookmarks, personalised feeds, notifications, advanced analytics, automatic
Instagram sync, an advanced search service, revision history, multi-language
publishing, dark theme, and editorial workflow.

Do not build these unless explicitly asked.
