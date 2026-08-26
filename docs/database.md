# Full Story — Database Schema

PostgreSQL on Supabase. All primary keys are `uuid`.

---

## 1. `authors`

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| user_id | uuid, nullable | Supabase Auth user id |
| name | text | Author display name |
| email | text, unique | Login/contact email |
| avatar_url | text, nullable | |
| bio | text, nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

## 2. `categories`

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| name | text, unique | Category name |
| slug | text, unique | URL-safe category slug |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

## 3. `articles`

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| headline | text | |
| sub_headline | text, nullable | |
| slug | text | Used in the public URL |
| category_id | uuid, FK -> categories.id | |
| author_id | uuid, FK -> authors.id | |
| hero_image_url | text, nullable | |
| content_html | text | Article content |
| tags | text[] | |
| status | article_status | draft / published |
| view_count | bigint | Default 0. Lifetime |
| published_at | timestamptz, nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### Enum: `article_status`

```text
draft
published
```

---

## 4. `article_views`

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| article_id | uuid, FK -> articles.id | |
| viewed_at | timestamptz | |

---

## 5. `article_instagram_post`

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| article_id | uuid, FK -> articles.id | |
| instagram_url | text | Instagram post/reel URL |
| sort_order | int | Default 0 |
| created_at | timestamptz | |

---

## Relationships

```text
authors (1) --< (many) articles

categories (1) --< (many) articles

articles (1) --< (many) article_views

articles (1) --< (many) article_instagram_post
```
