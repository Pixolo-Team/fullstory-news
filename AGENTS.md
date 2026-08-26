# Full Story - Repository Standards

Standing rules for anyone, human or agent, working in this repository.

Every rule here applies to **all** code regardless of app. App-specific rules are
in `apps/*/AGENTS.md` and are additional, never a replacement.

| App | Stack | Rules |
| --- | ----- | ----- |
| `apps/frontend` | Astro | [apps/frontend/AGENTS.md](./apps/frontend/AGENTS.md) - AS-1..AS-15 |
| `apps/admin` | Next.js | [apps/admin/AGENTS.md](./apps/admin/AGENTS.md) - FE-1..FE-11 |
| `apps/backend` | NestJS | [apps/backend/AGENTS.md](./apps/backend/AGENTS.md) - BE-1..BE-13 |

Severity levels used throughout: **CRITICAL** blocks a merge, **WARNING** must be
justified, **SUGGESTION** is advisory.

---

# Part 1 - Project rules

## Terminology - not negotiable

| Layer | Term | Example |
| ----- | ---- | ------- |
| Public UI text | **Story** | "Trending Stories", "Similar Stories" |
| Public URL | `story` | `/story/[slug]/[id]` |
| Database | `article` | `articles`, `article_views`, `article_instagram_post` |
| Backend code, types | `Article` | `ArticleData`, `ArticleStatus` |

Never use "News" as primary UI terminology. Never rename the public URL - it is a
contract with search engines and with anyone who has shared a link.

## Engineering principle

```text
simple > clever
clear > abstract
required > speculative
maintainable > over-engineered
```

This is an MVP and a first experiment for the client. Do not add infrastructure,
libraries, abstractions, tables, services or patterns that are not currently
justified.

## Before you make a technology decision

Read [docs/decisions.md](./docs/decisions.md). Eight decisions are deliberately
open. If you close one, write down the options considered and why - do not decide
silently in a commit.

If a requested change forces a second decision, name the second decision rather
than folding it into the edit.

## Branding

Client branding has not arrived. Both apps use neutral placeholder tokens in a
single file each:

- `apps/frontend/src/styles/global.css`
- `apps/admin/src/app/globals.css`

Components reference tokens. Never hard-code a colour, font or brand string in a
component.

## Design direction

Typography, readability, white space, clear hierarchy, simple grids, minimal
decoration. The Story is the visual focus. The public site must not look like a
fintech dashboard, a SaaS app or a dense enterprise portal.

## Out of scope for the MVP

Do not build unless explicitly asked: reader accounts, multiple admin roles,
permissions, comments, likes, reactions, bookmarks, personalised feeds,
notifications, advanced analytics, automatic Instagram sync, an advanced search
service, revision history, multi-language publishing, dark theme, editorial
workflow.

## Documentation to keep current

| File | Covers |
| ---- | ------ |
| `docs/architecture.md` | Apps, data flow, deployment |
| `docs/database.md` | Schema |
| `docs/decisions.md` | Decisions made and open |
| `docs/api.md` | Planned endpoint surface |

## Repo conventions

- ASCII only in docs and diagrams - `+---+` and `|`, not box-drawing characters.
  The team is on Windows and cp1252 consoles fail on them.
- Timestamps are ISO-8601 UTC in transit. Convert to local time in the browser.
- `content_html` is sanitised on the way in, at the API layer - never trusted at
  render time.

---

# Part 2 - Shared code rules (SR-1..SR-8)

These apply to every file in every app.

## SR-1: No console statements (CRITICAL)

Never in committed code: `console.log`, `console.error`, `console.warn`,
`console.debug`.

Use a logger where output is genuinely needed.

## SR-2: No unused code (WARNING)

Remove unused imports, unused variables, unreachable code and commented-out dead
code. Version control is the history; the file is not.

## SR-3: Explicit error handling (CRITICAL)

Errors must never be swallowed silently.

Incorrect:

```ts
catch (error) {
  return null;
}
```

Correct:

```ts
return { data: null, error };
// or
throw new Error('Failed to create article');
```

## SR-4: No hardcoded magic values (WARNING)

Repeated or reusable values live in `src/constants/`, `src/config/` or
`src/globals/`.

Incorrect:

```ts
const PAGE_SIZE = 10;
```

Correct:

```ts
const PAGE_SIZE = DEFAULT_PAGE_SIZE;
```

## SR-5: JSDoc on all exported functions (CRITICAL)

Every exported function needs at minimum a one-line JSDoc.

Incorrect:

```ts
export async function getArticlesRequest() {}
```

Correct:

```ts
/**
 * Fetches published articles with pagination
 */
export async function getArticlesRequest() {}
```

Backend functions additionally require `@param` and `@returns`. See BE-11.

## SR-6: No secrets or hardcoded credentials (CRITICAL)

Never commit API keys, passwords, tokens or credentials. Use environment
variables. `.env` files are app-scoped and mirrored in `.env.example`.

## SR-7: Commenting (SUGGESTION)

Comments explain **why**, not what.

Bad:

```ts
// increment i
i++;
```

Good:

```ts
// Trending uses a 7-day window, so older view rows are intentionally ignored
```

## SR-8: Function size and clarity (SUGGESTION)

- Small, single-purpose functions
- Max two levels of nesting preferred
- Early returns over nested if/else
- Readability over cleverness

---

# Part 3 - Naming, everywhere

These three suffixes are CRITICAL in all three apps. They are the convention
most often broken.

| Kind of function | Suffix | Example |
| ---------------- | ------ | ------- |
| Makes an API, HTTP, DB, Supabase or external call | `Request` | `getArticlesRequest()` |
| Contains business logic | `Service` | `mapArticleListingService()` |

| Kind of type | Suffix | Example |
| ------------ | ------ | ------- |
| Interface, type, DTO, API response, domain model | `Data` | `ArticleData`, `CategoryData` |

Also universal:

- Files are **kebab-case** (`article.service.ts`, `get-articles.request.ts`).
  Exception: `.astro` and `.tsx` component files may be PascalCase.
- Functions start with a **verb** and are **camelCase**.
- Imports use the `@/` alias. Relative imports (`../`) are CRITICAL violations.
- No default exports. No wildcard imports.
