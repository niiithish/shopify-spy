# Shopify Spy — Frontend

Frontend for browsing scraped Shopify App Store data. Find **trending** and **early-stage** apps so you can spot niches and build better products.

> Part of the [shopify-spy](https://github.com/niiithish/shopify-spy) monorepo (`frontend/`).

## Stack

- **Next.js 16** (App Router)
- **React 19** + **TanStack Query** (client caching — avoids hammering Turso)
- **Turso / libSQL** (via server API routes only)
- **Tailwind CSS 4** + **shadcn/ui** (base-nova)
- **Bun** (package manager — do not use npm)

## Setup

Env is shared at the **monorepo root** (not under `frontend/`):

```bash
# from repo root (shopify-spy/)
cp .env.example .env
# fill in TURSO_DATABASE_URL and TURSO_AUTH_TOKEN

cd frontend
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Dashboard — stats, hot apps, opportunities, top keywords |
| `/trending` | Apps with trending score ≥ 50 |
| `/opportunities` | High rating, ≤50 reviews, recent review activity |
| `/apps` | Full catalog with search, filters, keyword deep-links |
| `/apps/[id]` | App detail + same-keyword competitors |
| `/keywords` | Niche explorer |
| `/favorites` | Bookmarked apps (per-browser client id) |

## API

All DB access is server-side:

- `GET /api/stats`
- `GET /api/apps` — query params: `search`, `keyword`, `price`, `sort`, `order`, `mode`, `page`, …
- `GET /api/apps/[id]`
- `GET /api/keywords`
- `GET|POST|DELETE /api/favorites`

TanStack Query uses a **60s staleTime** and disables refetch-on-focus so list views stay snappy without re-hitting the database on every navigation.

## Scripts

```bash
bun run dev
bun run build
bun run start
bun run typecheck
bun run lint
```
