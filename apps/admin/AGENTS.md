# apps/admin - Next.js Coding Standards (FE-1..FE-11)

Admin panel. Next.js App Router + TypeScript + Tailwind.

**Read [../../AGENTS.md](../../AGENTS.md) first** - the shared rules SR-1..SR-8
apply here in full and are not repeated below.

> **Path note:** the house rule set is titled "Frontend Rules - Next.js
> (apps/frontend)". In this repository the Next.js app is `apps/admin/` and
> `apps/frontend/` is Astro. These rules apply to the **Next.js app**, which is
> this one, regardless of folder name.

---

## FE-1: Import alias (CRITICAL)

All imports use the `@/` alias. Relative imports (`../`, `../../`) are never
allowed.

Incorrect:

```ts
import { getArticles } from '../../services/article.service';
import { ArticleCard } from '../../../components/article-card';
```

Correct:

```ts
import { getArticlesRequest } from '@/services/article.service';
import { ArticleCard } from '@/components/article-card';
```

Every relative import is a CRITICAL violation.

---

## FE-2: File naming (WARNING)

Files use **kebab-case**.

Incorrect: `ArticleService.ts`, `GetArticles.ts`, `ArticleProfile.ts`

Correct: `article.service.ts`, `article-profile.request.ts`,
`create-article.service.ts`

**Exception:** UI component files (`.tsx`) may use PascalCase.

---

## FE-3: Function naming (WARNING)

Functions start with a **verb** and use **camelCase**.

Incorrect: `articles()`, `ArticleCreate()`, `currencyFormatter()`

Correct: `getArticlesRequest()`, `createArticleService()`,
`formatPublishedDateService()`

---

## FE-4: API request function naming (CRITICAL)

Any function making an API, HTTP, database, GraphQL, Supabase or external call
must end with **Request**.

Incorrect: `fetchArticles()`, `loadArticles()`, `getArticles()`, `articlesApi()`

Correct: `getArticlesRequest()`, `createArticleRequest()`,
`updateArticleStatusRequest()`

---

## FE-5: Service function naming (CRITICAL)

All business logic lives in service files. Service functions end with
**Service**. Services must never call UI components.

Incorrect: `createArticle()`, `articleMapper()`, `slugValidator()`

Correct: `createArticleService()`, `mapArticleListingService()`,
`validateSlugService()`

---

## FE-6: Data type naming (CRITICAL)

All interfaces, types, DTOs, API responses and domain models end with **Data**.

Incorrect:

```ts
interface Article {}
interface ArticleProfile {}
type CategoryItem = {};
```

Correct:

```ts
interface ArticleData {}
interface ArticleProfileData {}
type AuthenticationResponseData = {};
```

---

## FE-7: React component structure order (CRITICAL)

Every React function component follows this exact internal order:

1. Navigation (`useRouter`)
2. Context
3. Refs (`useRef`)
4. States (`useState`)
5. Helper Functions
6. UseEffects (`useEffect`)

And must contain these section comments **exactly as written**:

```ts
// Define Navigation
// Define Context
// Define Refs
// Define States
// Helper Functions
// Use Effects
```

A component missing these comments, or with hooks out of order, is a CRITICAL
violation.

Correct structure:

```tsx
/** Article listing page */
export default function ArticlesPage() {
  // Define Navigation
  const router = useRouter();

  // Define Context

  // Define Refs
  const hasFetchedRef = useRef<boolean>(false);

  // Define States
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper Functions
  /**
   * Fetches articles from the API
   */
  const fetchArticles = async () => {
    const { data, error } = await getArticlesRequest();
    if (error) {
      setIsLoading(false);
      return;
    }
    setArticles(data ?? []);
    setIsLoading(false);
  };

  // Use Effects
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchArticles();
  }, []);

  return <div>...</div>;
}
```

---

## FE-8: Image component (WARNING)

Use `Image` from `next/image`, not `<img>`.

Incorrect:

```tsx
<img src="/images/hero.jpg" />
```

Correct:

```tsx
import Image from 'next/image';
<Image src="/images/hero.jpg" alt="Hero" width={800} height={400} />;
```

`<img>` is allowed only for external HTML or third-party embeds.

---

## FE-9: Link component (WARNING)

Internal navigation uses `Link` from `next/link`, not `<a>`.

Incorrect:

```tsx
<a href="/articles">Articles</a>
```

Correct:

```tsx
import Link from 'next/link';
<Link href="/articles">Articles</Link>;
```

`<a>` is allowed only for external links.

---

## FE-10: Programmatic navigation (WARNING)

Use `router.push()` from `next/navigation`.

```ts
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/articles');
```

Use it for redirects after API calls, after login, and any navigation triggered
inside a function.

---

## FE-11: Navigation quick reference

| Scenario | Required method |
| -------- | --------------- |
| UI link | `<Link>` from `next/link` |
| Programmatic redirect | `router.push()` |
| External URL | `<a href>` |
| Images | `<Image>` from `next/image` |

---

# Admin-specific rules

Everything above is the house Next.js standard. Everything below is specific to
this app.

## Scope

Three things only:

1. Login and logout (Supabase Auth, email + password)
2. Stories - list, create, edit, delete, save draft, publish
3. Categories - list, add, edit, delete

Not in scope: static page editing, user management, roles, analytics. Static page
content lives in the frontend codebase, not the database.

## Folder layout

```text
src/
|- app/               App Router routes
|  |- login/
|  |- (dashboard)/    authenticated shell
|- components/        reusable UI
|- services/          business logic       (*Service)
|- requests/          API calls            (*Request)
|- lib/               supabase client
|- constants/
|- config/
|- hooks/
|- types/             shared types         (*Data)
```

Create a folder when you have something to put in it. Do not pre-create empty
directories.

## Rules

- **App Router, server components by default.** Add `'use client'` only where a
  component needs state, effects or browser APIs. FE-7's structure order applies
  to client components.
- **Auth is enforced in middleware**, not per page. Unauthenticated requests to
  `(dashboard)` routes redirect to `/login`.
- **The Supabase secret key never reaches the browser.** Only `NEXT_PUBLIC_*` values
  are client-visible - the Supabase URL and the publishable key.
- **Sanitise editor HTML on the server** before storing it in
  `articles.content_html`. Never at render time.
- **Slugs** are generated from the headline and stay editable. Warn before
  changing the slug of a published Story - the public URL breaks.
- **Deleting a Category that still has articles is blocked, not cascaded.**
  Every article requires a category.
- **Draft and Publish are distinct actions.** Publishing sets `published_at` the
  first time only.
- **Never render drafts anywhere a public token could reach.**

## Forms

Plain, labelled, keyboard-usable. This is an internal tool, not a showcase.
Every input needs a `<label>`. Every destructive action needs a confirmation.

## Open

The rich text editor is not chosen - see
[docs/decisions.md](../../docs/decisions.md). Do not add one without closing that
decision.
