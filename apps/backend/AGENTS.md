# Backend Coding Standards — `@full-story/backend`

> **These rules are mandatory.** All contributors — human or AI — must follow them strictly.
> This service is the single source of truth for published content and view counts.
> **Correctness, draft safety, and clarity are more important than cleverness.**
> If code works but violates standards → **it is incorrect.**

Project context: [../../AGENTS.md](../../AGENTS.md) · Schema: [../../docs/database.md](../../docs/database.md)

The schema is the source of truth — **never invent schema.**

**Stack:** NestJS 11 · Supabase PostgreSQL · TypeScript strict · Node 20+ · tsc-alias

> **Terminology:** the database and this codebase say `article`. The public UI says
> **Story**. Never mix them. See [../../AGENTS.md](../../AGENTS.md).

---

## 1. Import Rules (MANDATORY)

Always use the `@/` alias. Never use relative imports.
Always use `.js` extensions — `moduleResolution` is `nodenext`.

```ts
// ✅ Correct
import { createArticleService } from "@/modules/articles/articles.service.js";

// ❌ Incorrect
import { createArticleService } from "../../modules/articles/articles.service";
```

Every file follows this grouped import order:

```ts
// TYPES //
import type { ArticleData } from "@/modules/articles/articles.types.js";

// CONFIG //
import { supabaseConfig } from "@/config/supabase.config.js";

// CONSTANTS //
import { ARTICLE_PAGE_SIZE } from "@/common/constants/pagination.constants.js";

// UTILS //
import { toSlugUtil } from "@/common/utils/slug.util.js";

// SERVICES //
import { ArticlesService } from "@/modules/articles/articles.service.js";

// LIBRARIES //
import { Controller, Get } from "@nestjs/common";
```

Always `import type` for type-only imports. No default exports, no wildcard imports,
no unused imports. Never change the group order.

---

## 2. File Naming Rules

All files are **kebab-case** with a role suffix. No PascalCase files in this app.

| Type | Convention | Examples |
| --- | --- | --- |
| Module | `<module>.module.ts` | `articles.module.ts` |
| Controller | `<module>.controller.ts` | `articles.controller.ts` |
| Service | `<module>.service.ts` | `articles.service.ts` |
| Repository | `<module>.repository.ts` | `articles.repository.ts` |
| DTO | `<module>.dto.ts` | `articles.dto.ts` |
| Types | `<module>.types.ts` | `articles.types.ts` |
| Utils | `<name>.util.ts` | `slug.util.ts` |
| Constants | `<name>.constants.ts` | `pagination.constants.ts` |

```
// ✅ Correct
articles.service.ts
slug.util.ts

// ❌ Incorrect
ArticlesService.ts
slugUtil.ts
```

---

## 3. Function Naming Rules

Functions start with a **verb**, use **camelCase**, and carry their layer's suffix.

```ts
// ✅ Correct
getArticles();                       // controller — HTTP action
createArticleService();              // service
findPublishedArticlesRepository();   // repository

// ❌ Incorrect
articles();
handle();
doWork();
```

Constants are `UPPER_SNAKE_CASE`. Variables are `camelCase`, descriptive only.

---

## 4. Architecture Rules (STRICT)

Flow must always be:

```
Module → Controller → Service → Repository → Postgres
```

| Layer | Responsibility |
| --- | --- |
| Module | Wire providers and imports only |
| Controller | Parse/validate request, call service, return result |
| Service | Business logic, orchestration, domain rules |
| Repository | Supabase / query builder calls only |
| DTO | Request + response shapes with validation decorators |
| Types | TypeScript interfaces only |

Never break this flow:

- No DB queries in controllers
- No HTTP concerns in services
- No business logic in the module file
- No Supabase calls outside repositories

---

## 5. Service Layer Rules

- Business logic must live in `modules/<module>/<module>.service.ts`
- Service functions must end with `Service`
- Services orchestrate: repositories, domain rules, transactions
- **Services never touch HTTP** — no request, response, or status codes

---

## 6. Repository Layer Rules

- All queries must live in `<module>.repository.ts`
- Repository functions must end with `Repository`
- Repositories **only read/write data** — no business decisions allowed

```ts
// ✅ Correct
findPublishedArticlesRepository();
insertArticleViewRepository();
```

---

## 7. Data Type Naming Rules (STRICT)

All data types must end with `Data`. DTO classes must end with `Dto`.
Always use `interface`, never `type`, for object shapes.

```ts
// ✅ Correct
interface ArticleData {}
interface ArticleInstagramPostData {}
class CreateArticleDto {}

// ❌ Incorrect
interface Article {}
type Category = {}
```

---

## 8. JSDoc Comments (MANDATORY)

Every exported function, controller method, and service method:

```ts
// ✅ Correct
/**
 * Records a view and increments the article's lifetime counter
 * @param articleId - The article being viewed
 * @returns The updated lifetime view count
 */
```

---

## 9. Commenting Rules

Explain **WHY**, not **WHAT**. Use comments for:

- Business rules
- Draft-visibility reasoning
- Edge cases and known schema gaps

```ts
// ✅ Good
// Trending reads article_views, not view_count: the counter is lifetime and cannot be windowed

// ❌ Bad
// increment counter
count++;
```

---

## 10. Console Logs (STRICT)

**No console logs in committed code.**

Forbidden: `console.log`, `console.error`, `console.warn`.

Use Nest's `Logger` instead:

```ts
private readonly logger = new Logger(ArticlesService.name);
```

Never log secrets, tokens, or the service-role key.

---

## 11. Error Handling Rules

Never swallow errors silently. Errors must be **predictable and traceable**.

- Services throw **domain errors** — never `HttpException`
- A global filter in `common/filters/` maps them to HTTP status + the response envelope
- Services therefore stay free of HTTP concerns; the layer above owns status codes

```ts
// ✅ Correct
throw new ArticleNotFoundError(articleId);

// ❌ Incorrect
catch (e) { return null; }
```

---

## 12. Response Shape

All responses use the shared response helper. Never return `res.json()` directly.

```
{
  "data": <T> | null,
  "status": "success" | "error",
  "status_code": 200,
  "message": "Human readable message",
  "error": null | "Error detail string"
}
```

`data` is null on error, `error` is null on success. Never expose raw DB errors.

List endpoints put pagination inside `data`:

```
{ "items": [...], "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
```

---

## 13. Function & File Size Rules

Functions must:

- Do **one thing**
- Stay under **25–30 lines**
- Use **early returns**
- Keep nesting to **2 levels max**

Files must stay under **150 lines** — refactor if exceeded.

Prefer explicit logic over clever abstractions. **Maintenance matters more than elegance.**

---

## 14. Folder Architecture Rules

```
src/
├── config/
├── common/
│   ├── types/
│   ├── utils/
│   ├── constants/
│   └── filters/
└── modules/
    └── <module>/
        ├── <module>.module.ts
        ├── <module>.controller.ts
        ├── <module>.service.ts
        ├── <module>.repository.ts
        ├── <module>.dto.ts
        └── <module>.types.ts
```

Planned modules: `auth`, `categories`, `articles`, `search`, `media`.
Only `health` exists today.

> **No cross-layer shortcuts allowed.**

Never define regex, validation helpers, formatting helpers, magic numbers, or reusable
constants inside controllers, services, or repositories. They belong in `common/utils/`
and `common/constants/`.

---

## 15. Database Rules

- Queries only inside repositories
- Always check and handle the error path
- Prefer explicit column selection over `select("*")`
- Parameterised queries only — never string-concatenate SQL
- Never construct a Supabase client inside a module — inject it from `config/`
- Respect RLS policies — never bypass them
- Schema changes land only through migrations, never at runtime

---

## 16. Domain Rules (NON-NEGOTIABLE)

These must never be duplicated in a client:

| Rule | Requirement |
| --- | --- |
| Draft visibility | Unauthenticated reads return `status = 'published'` only. Enforced in the service, so no route can forget |
| View counting | An article read writes an `article_views` row **and** increments `articles.view_count` in the same transaction |
| Trending | Computed from `article_views` over a rolling 7 days. Never from `view_count` — that counter is lifetime and cannot be windowed |
| `published_at` | Set once, on the first transition to `published`. Never overwritten on later edits |
| Slug immutability | Changing the slug of a published article breaks `/story/[slug]/[id]`. Reject or warn — never change it silently |
| Category deletion | Blocked while any article references the category. Never cascade — every article requires a category |
| HTML sanitisation | `content_html` is sanitised on write, before storage. Never trusted at render time |
| Similar articles | Same category, excluding the current article, most recent first |

> A draft leaking to an unauthenticated caller is unpublished journalism reaching the
> public. Treat it as a Sev-1 bug, not a style issue.

---

## 17. Security & Environment Rules

- Never log secrets or expose env variables
- Validate all input via DTOs before it reaches a service
- No hardcoded credentials
- The **service-role key never leaves this service** — it is not exposed to the
  admin or the public site
- Env vars are defined in `.env`, mirrored in `.env.example`, and read only through
  `config/` — never scattered `process.env` calls

---

## 18. TypeScript Rules

- Strict mode enabled
- No `any`
- Always explicit return types
- Always `interface` over `type`
- Always `import type` for type-only imports
- Named exports only

---

## 19. AI Assistant Rules

When generating code, AI must:

- Follow naming rules exactly
- Never introduce unused variables
- Never leave commented-out code
- Never add console logs
- Match the project structure
- Prefer predictable patterns
- Ask for clarification if unsure

---

## API Surface

All routes are prefixed `/api`. Resources are named `article`, matching the
database; the public URL stays `/story/[slug]/[id]`.

There are **no static page endpoints** — Privacy Policy, Terms and Grievance live
in the frontend codebase. There is no `static_pages` table.

Full planned surface: [../../docs/api.md](../../docs/api.md).

---

## Commands

Run from `apps/backend/`:

```bash
npm install
npm run dev            # watch mode, :4000
npm run build          # nest build
npm run lint
npm run typecheck
```

Health check: `GET http://localhost:4000/api/health`

---

## Open Decisions

- **Deployment.** NestJS is a long-lived process and does not map cleanly onto
  Vercel serverless. Do not force it.
- **Search implementation.** Postgres `ILIKE` versus full-text search.

Both in [../../docs/decisions.md](../../docs/decisions.md).

---

## Final Rule (Non-Negotiable)

> **Working code that violates standards is incorrect.**

This service decides what the public sees and what stays a draft.
**Correctness, draft safety, and trust are mandatory.**
