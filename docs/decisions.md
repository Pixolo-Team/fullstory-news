# Full Story — Decisions & Open Items

Decisions are recorded here rather than made silently in code. Anything marked
**Open** should be discussed and resolved before it is implemented.

## Status summary

| #  | Decision                   | Status                                |
| -- | -------------------------- | ------------------------------------- |
| 1  | Public frontend framework  | **Decided** — Astro                   |
| 2  | Monorepo tooling           | **Decided** — pnpm workspaces         |
| 3  | Database & auth            | **Decided** — Supabase                |
| 4  | Content naming             | **Decided** — `article` in code, "Story" in UI |
| 5  | Static page content        | **Decided** — in the codebase, not the database |
| 6  | Design system              | **Open** — shadcn/ui leading          |
| 7  | Rich text editor           | **Open**                              |
| 8  | Image / media storage      | **Decided** — Supabase Storage        |
| 9  | Search implementation      | **Decided** — Postgres `ILIKE`        |
| 10 | Instagram integration      | **Open** — manual URLs preferred      |
| 11 | Backend deployment         | **Open**                              |
| 12 | SEO scope                  | **Open**                              |
| 13 | Client branding            | **Blocked** — awaiting assets         |
| 14 | Backend coding standard    | **Decided** — NestJS standard, own rule set |
| 15 | Code-review path routing   | **Open** — paths are inverted        |
| 16 | Unpublish vs published_at  | **Decided** — clear `published_at` on unpublish |
| 17 | Category ordering          | **Open** — no sort_order column       |
| 18 | API access control         | **Decided** — gated at the admin app  |

---

## 1. Public frontend framework — Decided: Astro

**Options considered:** Next.js, Astro.

**Decision:** Astro.

**Reasoning:** The public site is content-heavy and read-mostly. Astro ships
static HTML with no JavaScript by default, which suits a journalism site whose
selling point is fast, simple reading, and it keeps interactivity explicit
(the clock, share buttons, search) rather than shipping a framework runtime to
every reader.

**Consequences:**

- The admin panel stays a separate Next.js app — React-first and behind auth,
  which is the opposite workload.
- Any React-based design system on the public site runs as an island. See
  decision 6.
- Search results and any request-time data need a client-side fetch or an SSR
  adapter. See decision 9.

---

## 2. Monorepo tooling — Decided: pnpm workspaces

No Turborepo or Nx. Three apps and one shared package do not justify a build
orchestrator. Add one when build times actually hurt.

---

## 3. Database & auth — Decided: Supabase

Postgres plus Auth from one vendor, with email + password for the single MVP
admin. `authors.user_id` maps to the Supabase Auth user, so additional authors
can be added later without a schema redesign.

---

## 4. Content naming — Decided

| Layer | Term |
| ----- | ---- |
| Database tables and columns | `article`, `article_views`, `article_instagram_post` |
| Backend code and shared types | `Article` |
| Public UI text | **Story** |
| Public URL | `/story/[slug]/[id]` — unchanged |

**Reasoning:** "Story" is the client's chosen reader-facing word and a public URL
is a contract with search engines and anyone who has shared a link, so it stays.
Internally, `article` is the ordinary technical term and avoids collisions with
"story" in other senses.

**Open sub-question:** whether the REST resource is `/articles` (matching the
database) or `/stories` (matching the public URL). `/articles` is currently used
in [api.md](./api.md) on the grounds that the API is internal. Flag this if you
disagree — it is cheap to change now and awkward later.

---

## 5. Static page content — Decided: in the codebase

Privacy Policy, Terms & Conditions and Grievance are static content in the
frontend, not database rows.

**Reasoning:** this copy changes rarely and is supplied by the client as final
text. Storing it removes a table, three endpoints and an admin screen for no
practical benefit.

**Consequence:** updating legal copy is a code change and a deploy. Confirm the
client accepts that, since it means they cannot edit it themselves.

---

## 6. Design system — Decided: Tailwind 4 plus existing public tokens

| Option | Fit |
| ------ | --- |
| **shadcn/ui** | Minimal, unstyled-by-default, copy-in components. Imposes no visual identity, which matters while branding is pending. Strong for the Next.js admin. |
| **Razorpay Blade** | Good for form-heavy admin screens, tables and dashboards. Its visual language is product/fintech-oriented — likely wrong for the public journalism site. |
| **MUI / Ant Design** | Strong opinions and heavy runtimes. Both fight the minimal, typography-first direction. |
| **Chakra UI** | Reasonable, but runtime-CSS-heavy and React-only. |

**Decision:** On 2026-09-02, the public Astro site moved to Tailwind 4 through
Astro's official Vite plugin, while keeping the existing Remarque token CSS
already loaded in the app. The admin decision remains open separately.

**Reasoning:** The public site needs utility-class layout work without adding a
React runtime to every reader-facing page. Tailwind fits Astro's static-first
HTML well, and keeping the current token CSS avoids a full visual rewrite while
branding is still pending.

**Consequences:**

- **Public site** — Tailwind utilities are available in Astro components.
- Existing design-token CSS stays in place until a broader visual cleanup is
  explicitly requested.
- **Admin** — no silent change. Its component-library choice remains separate.

---

## 7. Rich text editor — Open

For the article body in the admin panel. Output must be HTML, since
`articles.content_html` stores HTML.

| Option | Notes |
| ------ | ----- |
| **TipTap** | Headless, ProseMirror-based, clean HTML output, good React support. Most flexible. |
| **BlockNote** | Notion-style block editor, good defaults, less control over markup. |
| **CKEditor** | Very capable, heavier; licensing needs checking for commercial use. |
| **Quill** | Simple and old; weaker React integration. |

**To decide:** how much formatting the client actually needs. If it is headings,
bold/italic, links, lists, images and embeds, TipTap is the likely answer.

**Requirement regardless of choice:** sanitise HTML on the way in, before it is
stored, and treat `content_html` as trusted only because of that.

---

## 8. Image / media storage — Decided: Supabase Storage

**Decision:** Supabase Storage.

**Reasoning:** It keeps database, auth and media under one vendor for the MVP,
which is the smallest operational footprint. The admin and public site still
store URLs only, so the storage backend can be swapped later behind the single
`POST /upload/image` endpoint if usage outgrows this choice.

---

## 9. Search implementation — Decided: Postgres `ILIKE`

Scope: match headline, sub-headline, tags and article content. Nothing advanced.

**Decision:** Postgres `ILIKE`.

**Reasoning:** The content volume is still MVP-sized and the brief explicitly
favours simple over speculative. `ILIKE` keeps the search endpoint easy to read
and cheap to ship now.

**Consequence:** search is intentionally basic. It matches headline,
sub-headline and stored article HTML text, and can be upgraded later without
changing the frontend route contract.

---

## 10. Instagram integration — Open (manual URLs preferred)

For the MVP an admin pastes Instagram post/reel URLs onto an article
(`article_instagram_post`). No API sync, no scraping.

**Open:** how the URLs render on the article page — Instagram's official embed
script (which adds third-party JavaScript and tracking to an otherwise light
page) or a plain link card. A plain card is more in keeping with the simplicity
USP.

---

## 11. Backend deployment — Open

Frontend and admin go to Vercel. NestJS does not: it is a long-lived process, and
forcing it into serverless functions costs cold starts and complicates anything
stateful.

| Option | Notes |
| ------ | ----- |
| **Railway / Render / Fly.io** | Container or process hosting. Natural fit for NestJS. |
| **Vercel serverless** | Possible, but adapts poorly and constrains later work. Do not force it. |
| **Supabase Edge Functions** | Would mean dropping NestJS. A different architecture. |

---

## 12. SEO scope — Open

The MVP should be *structured* so SEO can be added easily, not have it fully
built at setup. Likely eventual scope: page titles, meta descriptions, Open
Graph, social sharing metadata, sitemap, `robots.txt`, and structured data for
articles.

Astro handles all of this well. Do not over-engineer it now.

---

## 13. Client branding — Blocked

Awaiting logo, brand colours, fonts and visual references.

Until then: neutral placeholder tokens, defined in one file per app. Do not
hard-code an arbitrary brand identity in a component. When assets arrive,
applying them should mean editing the token blocks and nothing else.

---

## 14. Backend coding standard — Decided: NestJS with its own rule set

**Resolved.** The organisation runs two backends on different stacks, and they
have separate standards. The Hono rule set (`backend-rules.md`) governs the Hono
service; NestJS services follow the NestJS standard, modelled on
`@skorost/backend`.

`apps/backend/AGENTS.md` now carries that standard in full. Key points where it
differs from the Hono rules, deliberately:

| Area | NestJS standard |
| ---- | --------------- |
| Layering | `Module -> Controller -> Service -> Repository -> Postgres`. A repository layer the Hono rules do not have. |
| Imports | `@/` alias **with `.js` extensions** — `moduleResolution` is `nodenext`. |
| Errors | Services throw domain errors; a global filter in `common/filters/` maps them to status codes. Not the Hono `QueryResponseData<T>` return pattern. |
| DTOs | Classes suffixed `Dto`, validated with decorators. Data interfaces still suffixed `Data`. |
| Logging | Nest `Logger`, never `console`. |

The intent is identical to the Hono rules: services never touch HTTP, the caller
owns status codes, queries stay in one layer, and naming is predictable.

**Earlier note now withdrawn:** an earlier version of this document suggested
switching the backend to Hono so the house rules would apply unchanged. That was
based on the mistaken assumption that no NestJS standard existed. It does. Stay
on NestJS.

---

## 15. Code-review path routing — Open

The house rule files route by folder path: `frontend-rules.md` says "apply to all
files under `apps/frontend/`" and means Next.js; `astro-rules.md` applies to
Astro projects.

In this repository that mapping is inverted:

| Path | Stack | House rules that would be applied | Correct rules |
| ---- | ----- | --------------------------------- | ------------- |
| `apps/frontend/` | Astro | Next.js (FE-*) | Astro (AS-*) |
| `apps/admin/` | Next.js | none — path unknown | Next.js (FE-*) |

Each `AGENTS.md` carries a note stating which rule set actually applies, but a
note does not help a tool that routes by path.

**Options:**

1. Update the house rule files to route by stack rather than path.
2. Rename the apps. Does not fully resolve it — the public site is still
   `apps/frontend` running Astro.
3. Rely on the `AGENTS.md` notes and reviewer judgement.

Option 1 is the real fix.

---

## 16. Unpublishing vs the `published_at` constraint — Decided: clear `published_at`

The database currently enforces:

```sql
constraint articles_published_at_matches_status check (
  (status = 'published' and published_at is not null)
  or (status = 'draft' and published_at is null)
)
```

**Decision:** keep the constraint and clear `published_at` when a Story moves
back to draft.

**Reasoning:** This avoids a schema migration while keeping the database rule
truthful: drafts do not carry a publication timestamp. The admin UI and API now
share one predictable behaviour instead of silently violating the constraint.

**Consequence:** re-publishing after an unpublish stamps a new `published_at`.
If preserving the first publication date becomes editorially important later,
the right follow-up is a dedicated `first_published_at` column.

---

## 17. Category ordering — Open

`categories` has no `sort_order` column, so the API can only order by name or
by insertion. Neither reproduces the intended navigation order:

```text
World, Tech, Politics, Sports
```

**Options:**

1. Add `sort_order int not null default 0` and an admin control for it.
2. Hard-code the order in the frontend and accept that the admin cannot
   change it.

Option 2 is the MVP answer; option 1 is correct once the client wants to
reorder without a deploy.

---

## 18. API access control — Decided: gated at the admin app, not the API

Only `/auth/*` requires a session. Stories CRUD, categories writes, dashboard
stats and media upload are unauthenticated.

Access to the admin is enforced in `apps/admin/src/app/(dashboard)/layout.tsx`,
which calls `GET /auth/me` on the server and redirects to `/login` when there is
no valid session. Nothing renders before that check, so no one browses the admin
without signing in.

**Reasoning:** the session handling added friction disproportionate to a
single-editor MVP, and the sign-in requirement people actually care about is
"can someone open the admin", which the page gate answers.

### What this protects

- Nobody reaches an admin page without a valid Supabase session.
- The public site is unchanged: `/articles/:slug/:id`, trending, latest and
  by-category still serve published Stories only.

### What this does not protect

The API is a separate public host. Anyone who finds it can:

- create and publish a Story
- edit or permanently delete any Story (no trash, no revision history)
- create, rename and delete Categories, which drive public navigation
- list drafts via `GET /articles?status=draft`, so unpublished work is readable

`authors.id` for a new Story falls back to the oldest author row, because there
is no session to attribute it to.

### Before real traffic

Reinstate protection on the write paths — a shared `X-Api-Key` header is the
smallest option and needs no session handling. Alternatively restrict the API
to the admin's origin at the network layer, so only the admin server can reach
it.
