# Full Story - Wireframes (Astro public site)

Low fidelity. Structure and content order only - no colour, no final copy.

Seven routes, two shared regions. These wireframes define structure and content
order only. Final design-system and branding choices remain open in
`docs/decisions.md`.

| Route | Page | Data |
|---|---|---|
| `/` | Home | API |
| `/[category]` | Category listing | API |
| `/story/[slug]/[id]` | Story | API |
| `/search` | Search | API |
| `/privacy-policy` | Privacy Policy | in repo |
| `/terms` | Terms & Conditions | in repo |
| `/grievance` | Grievance | in repo |

## Design constraints that drive every layout

- Story body never exceeds **42rem** (~65 characters). Listings go to 64rem.
- Sections sit **96px** apart. Paragraphs 24px.
- Type: editorial serif for headings, neutral sans for body, restrained mono for meta.
- No cards, no borders, no shadows, no rounded corners. Hairline rules and space.
- One accent, links only.
- An empty section renders nothing - never a heading over a gap.
- Public UI says **Story**. Never "News".

---

## Shared - Header

On every public page.

```text
+--------------------------------------------------------------+
|  FULL STORY                        Monday, 26 August - 14:20 |
+--------------------------------------------------------------+
|  World   Tech   Politics   Sports                     Search  |
+--------------------------------------------------------------+
```

- Brand, links to `/`
- Day, date, time in the **reader's local timezone** - client-side, not build-time
- Category nav from `GET /categories`
- Search: link to `/search`

Mobile: brand and search icon on row one, clock beneath, categories scroll
horizontally on row three. No hamburger - categories are the primary navigation.

## Shared - Footer

```text
+--------------------------------------------------------------+
|  Categories              Full Story                          |
|  World                   Privacy Policy                      |
|  Tech                    Terms & Conditions                  |
|  Politics                Grievance                           |
|  Sports                                                      |
+--------------------------------------------------------------+
|  (c) Full Story                                              |
+--------------------------------------------------------------+
```

Two columns desktop, stacked mobile.

---

## 1. Home

Route: `/`

```text
+------------------------- HEADER -----------------------------+

  TRENDING STORIES
  +----------------+ +----------------+ +----------------+
  | [hero image]   | | [hero image]   | | [hero image]   |
  | Headline       | | Headline       | | Headline       |
  | Sub-headline   | | Sub-headline   | | Sub-headline   |
  | Category | date| | Category | date| | Category | date|
  +----------------+ +----------------+ +----------------+

  LATEST STORIES
  ---------------------------------------------------------------
   Headline                                        [thumbnail]
   Sub-headline
   Category | date
  ---------------------------------------------------------------
   Headline                                        [thumbnail]
   ...

  WORLD                                           View all >
  +------------+ +------------+ +------------+ +------------+
  | Story card | | Story card | | Story card | | Story card |
  +------------+ +------------+ +------------+ +------------+

  TECH                                            View all >
  +------------+ +------------+ +------------+ +------------+
  +------------+ +------------+ +------------+ +------------+

  ... one block per Category, in category order

+------------------------- FOOTER -----------------------------+
```

| Section | Source | Count |
|---|---|---|
| Trending | `GET /articles/trending` | 3 - top views, last 7 days |
| Latest | `GET /articles/latest` | 8-10, newest first |
| Per category | `GET /articles/by-category` | 3-4 each + "View all" |

Notes:
- Trending uses image cards, Latest uses a dense list. The **contrast in density**
  is what separates them - not rules, not colour.
- No carousel. Nothing auto-rotates.
- A category with no published Stories: omit the whole block.
- Mobile: single column throughout. Trending stacks rather than scrolling.

---

## 2. Category

Route: `/[category]`

```text
+------------------------- HEADER -----------------------------+

  POLITICS

  ---------------------------------------------------------------
   Headline                                        [thumbnail]
   Sub-headline
   Author | date
  ---------------------------------------------------------------
   Headline                                        [thumbnail]
   Sub-headline
   Author | date
  ---------------------------------------------------------------
   ...

              < Prev    1  2  3  ...    Next >

+------------------------- FOOTER -----------------------------+
```

- Category name as page heading. No description, no hero.
- Published Stories, newest first.
- `GET /articles?category=<slug>&page=<n>&limit=<n>`

States:
- Empty: "No Stories in this Category yet." Header, footer, nav all remain.
- Unknown slug: 404.

---

## 3. Story

Route: `/story/[slug]/[id]`

The most important page. Everything is subordinate to the body copy.

```text
+------------------------- HEADER -----------------------------+

            Politics

            Headline, set large
            Sub-headline, lighter

            By Author | 26 August 2026

            [ WhatsApp ] [ X ] [ Facebook ] [ Copy link ]

            +----------------------------------+
            |          hero image              |
            +----------------------------------+

            Story body. Held to 42rem. Generous
            line height. Headings, lists, quotes
            and inline images styled for reading,
            nothing more.

            Tags:  #tag  #tag  #tag

            -----------------------------------

            RELATED INSTAGRAM POSTS
            +----------+ +----------+
            |  post    | |  post    |
            +----------+ +----------+

            -----------------------------------

            SIMILAR STORIES
            +------------+ +------------+ +------------+
            | Story card | | Story card | | Story card |
            +------------+ +------------+ +------------+

+------------------------- FOOTER -----------------------------+
```

Order: category, headline, sub-headline, byline + date, share, hero image, body,
tags, Instagram, similar.

Data:
- `GET /articles/:slug/:id` - Story, author, category, Instagram posts
- `GET /articles/:id/similar` - same category, newest first

Notes:
- Requesting the Story records a view.
- Share: WhatsApp, X, Facebook, Copy link. Native Web Share API on mobile
  where available, explicit buttons elsewhere.
- Body column is narrower than the page. Never full width.
- Omit Instagram and Similar sections entirely when empty.
- Instagram rendering (official embed vs plain link card) is undecided -
  wireframe assumes a plain card.

---

## 4. Search

Routes: `/search` and `/search/[search_param]`

```text
+------------------------- HEADER -----------------------------+

  SEARCH

  +---------------------------------+ +--------+
  | Search Stories                  | | Search |
  +---------------------------------+ +--------+

  12 results for "election"

  ---------------------------------------------------------------
   Headline
   Sub-headline
   Category | date
  ---------------------------------------------------------------
   ...

              < Prev    1  2  3    Next >

+------------------------- FOOTER -----------------------------+
```

- Input pre-filled with the current query
- Result count above the list
- Same row style as Category
- `GET /search?q=<query>&page=<n>&limit=<n>` - matches headline, sub-headline,
  tags, content

States:
- No query: input only. No "popular searches", no suggestions.
- No results: "No Stories found for that search." Input stays focused.

Note: results are request-time, which Astro does not produce statically. Needs
a client-side fetch or an SSR route - undecided.

---

## 5, 6, 7. Static pages

Routes: `/privacy-policy`, `/terms`, `/grievance`

```text
+------------------------- HEADER -----------------------------+

            Privacy Policy

            Body content. Single column, same
            42rem measure as a Story. Headings
            and lists, nothing else.

+------------------------- FOOTER -----------------------------+
```

- Content lives in the **frontend codebase**, not the database. No
  `static_pages` table, no `/pages/:slug` endpoint, no admin editing.
- Final copy supplied by the client.
- Grievance is not a form - contact and officer details are static text.

---

## Component inventory

Nine, hand-built as `.astro`. No component library on the public site.

| Component | Used on | Interactive |
|---|---|---|
| Header | every page | clock island |
| Footer | every page | no |
| Story Card | home, category, search, similar | no |
| Category Nav | header, footer | no |
| Share Buttons | story | island |
| Search | search page | island |
| Pagination | category, search | no |
| Empty State | category, search | no |
| Loading State | search results | no |

Three islands on the entire site: the clock, share, search. Everything else
ships as static HTML.

---

## Shared states

**Empty** - a sentence in muted ink, at body size. No illustration, no icon,
no bordered box. Header, footer and navigation always remain.

**Loading** - search only. A line of muted text. No skeletons, no spinners.

**404** - headline, one sentence, a link back to Home. Header and footer intact.

---

## Responsive

| Breakpoint | Behaviour |
|---|---|
| Below 640px | Single column everywhere. Category nav scrolls horizontally. Thumbnails above text, not beside. |
| 640-1024px | Trending 2-up. Category blocks 2-up. |
| Above 1024px | Trending 3-up. Category blocks 4-up. Story column stays 42rem. |

Story body measure never changes. Only the listings reflow.

---

## Out of scope

No reader accounts, comments, likes, bookmarks, personalised feeds,
notifications, dark theme, or newsletter signup. Do not wireframe them.
