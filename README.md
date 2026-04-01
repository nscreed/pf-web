# PF Web

Next.js frontend for Personal Finance app.

## Quick Start

```bash
# 1. Start backend first (in another terminal)
cd pf-backend && make dev

# 2. Then start frontend
cd pf-web
make setup   # install deps + create .env.local
make dev     # starts on http://localhost:3030
```

## Commands

| Command | What it does |
|---------|-------------|
| `make setup` | One-time: install deps, create `.env.local` |
| `make dev` | Start dev server on port 3030 |
| `make build` | Production build |

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Google OAuth login |
| `/dashboard` | Dashboard (protected) |
| `/transactions` | Transaction list + recurring tab |
| `/transactions/new` | Add transaction |
| `/settings` | Profile, categories, theme, export |

## Tech Stack

Next.js 16 + shadcn/ui + Tailwind CSS v4 + Recharts + axios

## Ports

| Service | Port |
|---------|------|
| Frontend | 3030 |
| Backend API | 3031 |
| MySQL | 3310 |
