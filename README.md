# Full Story

A simple journalism website. The client currently publishes only on Instagram;
this is their first website, built as an MVP to launch and evaluate before the
product is expanded.

Their USP is **simplicity** - simple language, easy-to-read Stories, clean
interfaces, minimal clutter. The content is the point; everything else gets out
of its way.

> **Terminology:** in public UI the unit of content is a **Story**, never "News".
> The database and backend code call it an `article`. See
> [docs/architecture.md](./docs/architecture.md).

## Status

Planning and repository structure only. Nothing is implemented, nothing is
installable yet - there is no workspace manifest and no dependencies. Each app
directory holds its intended config and a single placeholder entry point so the
shape is clear.

Read [docs/decisions.md](./docs/decisions.md) before building anything.

## Structure

```text
full-story/
|- apps/
|  |- admin/       Next.js  - admin panel for managing Stories
|  |- backend/     NestJS   - REST API
|  |- frontend/    Astro    - public website
|                  each app has its own AGENTS.md
|- docs/
|  |- architecture.md   system overview, apps, data flow, deployment
|  |- database.md       Supabase Postgres schema
|  |- decisions.md      decisions made and still open  <- read this first
|  |- api.md            planned API surface
|- AGENTS.md        standing rules for this repo  <- and this
|- README.md
```

## Intended stack

| Layer          | Choice                           |
| -------------- | -------------------------------- |
| Public website | Astro + Tailwind CSS             |
| Admin panel    | Next.js (App Router) + Tailwind  |
| Backend        | NestJS                           |
| Database       | Supabase Postgres                |
| Auth           | Supabase Auth (email + password) |

Planned URLs: frontend `:4321`, admin `:3000`, backend `:4000/api`.

## Documentation

| File | What it covers |
| ---- | -------------- |
| [architecture.md](./docs/architecture.md) | Apps, terminology, data flow, deployment, out-of-scope list |
| [database.md](./docs/database.md) | Five-table Supabase schema |
| [decisions.md](./docs/decisions.md) | Every decision - made and open |
| [api.md](./docs/api.md) | Planned endpoints. Scope, not implementation |

## Before you build a feature

Eight decisions in [docs/decisions.md](./docs/decisions.md) are deliberately
open - design system, rich text editor, image storage, search, Instagram
rendering, backend hosting, SEO scope, and branding. Document the reasoning when
you close one; do not decide silently in a commit.

Client branding has not arrived. Both apps use neutral placeholder tokens defined
in a single file each. Do not hard-code colours or fonts in components.

## Engineering principle

```text
simple > clever
clear > abstract
required > speculative
maintainable > over-engineered
```

The MVP should stay intentionally simple while remaining able to grow. Anything
in the out-of-scope list in [docs/architecture.md](./docs/architecture.md) -
reader accounts, comments, roles, notifications, dark theme and the rest - is not
to be built unless it is explicitly asked for.
