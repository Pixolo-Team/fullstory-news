# apps/frontend - Astro Coding Standards (AS-1..AS-15)

Public website. Astro + TypeScript + Tailwind.

**Read [../../AGENTS.md](../../AGENTS.md) first** - the shared rules SR-1..SR-8
apply here in full and are not repeated below.

Applies to all `.astro`, `.ts` and `.tsx` files in this app.

---

## AS-1: Import alias (CRITICAL)

All imports use the `@/` alias. Relative imports (`../`, `../../`) are never
allowed.

Incorrect:

```ts
import { getArticles } from '../../services/article.service';
```

Correct:

```ts
import { getArticlesRequest } from '@/services/article.service';
```

---

## AS-2: File naming (WARNING)

Files use **kebab-case**.

Incorrect: `ArticleService.ts`, `GetArticles.ts`

Correct: `article.service.ts`, `get-articles.request.ts`

**Exception:** `.astro` component files may use PascalCase.
`StoryCard.astro` and `story-card.astro` are both allowed.

---

## AS-3: Function naming (WARNING)

Functions start with a **verb**, use **camelCase**, and clearly describe the
action.

Incorrect: `articles()`, `ArticleCreate()`

Correct: `getArticlesRequest()`, `mapTrendingListingService()`

---

## AS-4: API request function naming (CRITICAL)

Any function making an API, HTTP, database or external call must end with
**Request**.

Incorrect: `fetchArticles()`, `loadArticles()`, `getArticles()`

Correct: `getArticlesRequest()`, `getTrendingArticlesRequest()`,
`searchArticlesRequest()`

---

## AS-5: Service function naming (CRITICAL)

Business logic lives in service files and ends with **Service**. Services must
never interact with UI components.

Incorrect: `createArticle()`, `articleMapper()`

Correct: `createArticleService()`, `mapArticleListingService()`

---

## AS-6: Data type naming (CRITICAL)

All interfaces, types, DTOs and domain models end with **Data**.

Incorrect:

```ts
interface Article {}
type ArticleItem = {};
```

Correct:

```ts
interface ArticleData {}
type ArticleResponseData = {};
```

---

## AS-7: Image component (CRITICAL)

Always use `Image` from `astro:assets`. Plain `<img />` is never allowed.

Incorrect:

```astro
<img src="/images/hero.jpg" alt="Hero" />
```

Correct:

```astro
---
import { Image } from 'astro:assets';
---

<Image src={heroImage} alt="Hero" width={800} height={400} />
```

Every `<img />` tag is a CRITICAL violation.

---

## AS-8: Icon usage (WARNING)

Icons use `astro-icon`. Custom icons live in `src/icons/`.

- No inline SVG
- No external icon libraries
- No hand-written `<svg>` elements for icons

Correct:

```astro
---
import { Icon } from 'astro-icon/components';
---

<Icon name="share" />
```

---

## AS-9: Data fetching pattern (CRITICAL)

Data is fetched in the **frontmatter** (`---` block), never in the component body
or a `<script>` tag.

Incorrect:

```astro
<script>
  const articles = await getArticlesRequest();
</script>
```

Correct:

```astro
---
import { getArticlesRequest } from '@/services/article.service';

const { data, error } = await getArticlesRequest();
---

<div>
  {data?.map((article) => <p>{article.headline}</p>)}
</div>
```

---

## AS-10: Hydration rules (WARNING)

Default rendering is server-side with no hydration directive. Hydrate only where
interactivity is genuinely required.

| Directive | When |
| --------- | ---- |
| `client:load` | Hydrate immediately on page load |
| `client:idle` | Hydrate when the browser is idle |
| `client:visible` | Hydrate when it enters the viewport |
| `client:only` | Skip SSR entirely |

Incorrect - over-hydrating static content:

```astro
<Header client:load />
<Footer client:load />
```

Correct:

```astro
<Header />
<SearchBar client:load />
<ShareButtons client:visible />
```

On this site, the only things that justify hydration are the local-time clock in
the header, share buttons, and search. Every kilobyte of JS shipped to a reader
needs a reason.

---

## AS-11: TailwindCSS rules (WARNING)

Tailwind utility classes only.

- Use theme tokens: `bg-paper`, `text-ink-muted`, `rounded-lg`
- Do **not** use `var()` in class values - use Tailwind tokens
- Do **not** use arbitrary values like `w-[347px]` unless unavoidable
- Use predefined radius classes: `rounded`, `rounded-lg`, `rounded-xl` - not
  `rounded-[12px]`
- Use responsive utilities: `sm:`, `md:`, `lg:`, `xl:`
- No inline `style=""` for visual styling

Incorrect:

```astro
<div style="width: 347px; background: var(--color-accent);" class="rounded-[12px]">
```

Correct:

```astro
<div class="w-80 bg-accent rounded-xl">
```

Tokens are defined in `src/styles/global.css` and are placeholders until client
branding arrives.

---

## AS-12: Design implementation (SUGGESTION)

When implementing UI from a design:

- Check all breakpoints - desktop, tablet, mobile
- Follow existing layout patterns; do not introduce new ones
- Reuse existing components before creating new ones
- Match spacing, typography and structure
- Never introduce new design patterns unilaterally

---

## AS-13: Section integration (WARNING)

After creating a section component: put it in the correct folder, import it into
the correct page, and follow existing rendering patterns. Do not leave section
components unregistered.

---

## AS-14: No inline SVG (WARNING)

Inline SVG is forbidden for icons and illustrations, including one-offs. Add the
icon to `src/icons/` and use `astro-icon`.

---

## AS-15: No new architecture patterns (CRITICAL)

Do not introduce new folder structures, utility patterns, component patterns or
data-fetching patterns that are not already in the project.

If something is unclear, ask. Reuse what exists.

---

# Frontend-specific rules

Everything above is the house Astro standard. Everything below is specific to
this app.

## Folder layout

```text
src/
|- pages/         file-based routing
|- layouts/       page shells
|- components/    reusable UI
|- sections/      page sections composed of components
|- services/      business logic          (*Service)
|- requests/      API calls               (*Request)
|- constants/     global constants
|- config/        app config
|- icons/         custom SVG icons for astro-icon
|- assets/        images and fonts processed by Astro
|- types/         shared types            (*Data)
|- styles/        global.css and design tokens
public/           static assets, unprocessed
```

Create a folder when you have something to put in it.

## Routes

| Route | Page | Source |
| ----- | ---- | ------ |
| `/` | Home - Trending, Latest, per-Category | API |
| `/[category]` | Category listing | API |
| `/story/[slug]/[id]` | Story | API |
| `/search` | Search | API |
| `/privacy-policy` | Privacy Policy | this repo |
| `/terms` | Terms & Conditions | this repo |
| `/grievance` | Grievance | this repo |

Static page content is **not** in the database and there is no `/pages/:slug`
endpoint.

## Rules

- **The Story is the visual focus.** Body text stays near a 65-75 character
  measure. Do not stretch article text to full page width.
- **The header clock renders in the reader's local timezone.** It must be
  computed in the browser, not at build time - a server-rendered timestamp is
  wrong for most readers.
- **Category navigation stays visible on mobile.** It scrolls horizontally rather
  than collapsing behind a hamburger; it is the primary navigation.
- **Omit empty sections entirely.** A Category with no published articles, an
  article with no Instagram posts or no similar articles - render nothing, not an
  empty heading.
- **Never render drafts.** Unauthenticated reads return published only.

## Accessibility

Semantic HTML first. Every image needs `alt`. Every form control needs a label.
Colour is never the only carrier of meaning.

## Open

- Search results are request-time, which Astro does not produce statically.
  Client fetch or SSR adapter is undecided.
- Instagram post rendering - official embed script versus a plain link card -
  is undecided. The embed adds third-party JavaScript and tracking to an
  otherwise light page.

Both in [docs/decisions.md](../../docs/decisions.md).
