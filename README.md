# Shopify Spy

Monorepo for scraping and browsing Shopify App Store data. Find **trending** and **early-stage** apps so you can spot niches and build better products.

| Path | What it is |
|------|------------|
| [`frontend/`](./frontend) | Next.js dashboard (browse apps, keywords, opportunities, favorites) |
| [`backend/`](./backend) | Go + Python scraper (discover apps, scrape details, store in Turso) |

## Quick start

### Backend (scraper)

```bash
cd backend
cp .env.example .env   # set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN
# see backend/README.md for Go/Python setup and scrape commands
```

### Frontend (dashboard)

```bash
cd frontend
cp .env.example .env.local   # same Turso credentials
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

```
Shopify App Store
       │
       ▼
  backend/          Go scraper + sitemap discovery
       │
       ▼
    Turso (libSQL)
       │
       ▼
  frontend/         Next.js App Router + API routes (server-side DB only)
```

Both apps talk to the same Turso database. The frontend never exposes DB credentials to the browser.

## Related (legacy) repos

This monorepo replaces the separate projects:

- [`shopify-spy-backend`](https://github.com/niiithish/shopify-spy-backend)
- [`shopify-spy-frontend`](https://github.com/niiithish/shopify-spy-frontend)

Prefer developing here under `/home/nithish/Work/shopify-spy`.
