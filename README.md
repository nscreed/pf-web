# PF Web

Next.js frontend with shadcn/ui, Google OAuth login, and dashboard.

## Quick Start

```bash
git clone git@github.com:nscreed/pf-web.git
cd pf-web
make setup   # installs deps + creates .env.local
make dev     # starts on http://localhost:3030
```

> Make sure the backend (`pf-backend`) is running on port 3031 before logging in.

## Commands

| Command | What it does |
|---------|-------------|
| `make setup` | First time setup (copies env, installs deps) |
| `make dev` | Start dev server on port 3030 |
| `make build` | Production build |

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Google OAuth login page |
| `/dashboard` | Dashboard (protected, requires login) |

## Tech Stack

- **Next.js 16** - React framework (App Router)
- **shadcn/ui** - UI components
- **Tailwind CSS v4** - Styling
- **Blue theme** - Energetic blue color scheme
