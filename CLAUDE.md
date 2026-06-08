# GitPilot — Claude Context

## What this project is
A browser extension + web dashboard that acts as a **git context assistant** — generates commit messages, PR titles/descriptions, branch names, code review summaries, release notes, and changelog entries using AI.

## Monorepo structure
```
apps/api          → NestJS backend (TypeScript)
apps/web          → React web dashboard (Vite + TanStack Router + shadcn/ui)
apps/extension    → Chrome extension MV3 (React + Vite + shadcn/ui)
packages/shared-types → Shared TypeScript DTOs used across all apps
```

## Tech stack
- **Backend**: NestJS, TypeORM, PostgreSQL, Redis (Upstash), Passport.js, JWT
- **Frontend**: React 19, TanStack Router, TanStack Query, shadcn/ui, Tailwind CSS
- **AI Providers**: Google Gemini Flash (default free tier), Anthropic Claude Haiku, OpenAI GPT-4o mini
- **Package manager**: pnpm workspaces

## Key conventions

### Backend
- All database changes go through **TypeORM migrations** — never use `synchronize: true` anywhere including local
- Generate migrations: `pnpm migration:generate -- -n MigrationName` from `apps/api`
- Run migrations: `pnpm migration:run` from `apps/api`
- Entities live in `src/{module}/{entity}.entity.ts`
- DTOs use `class-validator` decorators and live in `src/{module}/dto/`
- All modules follow NestJS standard structure: `module`, `controller`, `service`
- Rate limiting is per-user per-day **per generation type** via Redis key `rl:{userId}:{YYYY-MM-DD}:{type}`
- BYOK users bypass rate limiting entirely
- Never store raw diffs or generated output — `generation_history` is analytics metadata only (who, what type, which provider, token counts)

### Frontend (web + extension)
- Routing uses **TanStack Router file-based routing** — routes live in `src/routes/`
- UI components come from **shadcn/ui** — add via `npx shadcn@latest add <component>`
- Shared types imported from `@gitpilot/shared-types`
- API calls go through `src/lib/api.ts` (axios instance with JWT interceptor + auto-refresh)

### Extension-specific
- JWT stored in `chrome.storage.local` via `src/shared/auth.ts` — never localStorage
- Extension links to web account via **OTT flow**: web dashboard → `POST /auth/extension-token` → deep link → `POST /auth/exchange`
- Content scripts live in `src/content/` — `github.ts` handles GitHub pages

## Auth flow
Three paths, same JWT pair output:
1. **Email/password** — `POST /auth/register` or `POST /auth/login`
2. **GitHub OAuth** — optional shortcut on register/login page
3. **OTT extension link** — logged-in web user clicks "Connect Extension" → one-time token (60s TTL in Redis) → extension exchanges it for JWT

## Generation types
`commit` | `pr` | `branch` | `review-summary` | `release-notes` | `changelog`

Each type has its own rate limit counter. Free tier: 20 req/day per type.

## AI provider routing
- Free users → Gemini Flash by default (cheapest)
- BYOK users → use their encrypted API key + preferred provider
- Provider keys encrypted with AES-256-GCM, stored in `users.encryptedApiKey` + `users.apiKeyIv`

## Environment
Copy `apps/api/.env.example` to `apps/api/.env` and fill in values.
Local dev needs Docker running: `docker compose up -d` (Postgres 16 + Redis 7).

## Running locally
```bash
pnpm install
docker compose up -d
cd apps/api && pnpm migration:run
pnpm dev:api       # :3000
pnpm dev:web       # :5173
pnpm dev:extension # watch → dist/
```

## What's implemented vs TODO
### Done (scaffolded)
- Monorepo structure + pnpm workspaces
- NestJS app with TypeORM + ConfigModule wired
- All 3 TypeORM entities: `User`, `UsageDaily`, `GenerationHistory`
- `AIProvider` interface in `src/providers/provider.interface.ts`
- `data-source.ts` for TypeORM CLI migrations
- Extension `manifest.json`, service worker (OTT exchange), content script (GitHub), auth helpers
- Web: TanStack Router root route + landing page, axios API client
- Shared types package

### TODO (build in this order)
1. `AuthModule` — register, login, GitHub OAuth, refresh, OTT endpoints
2. `UsersModule` — profile, BYOK key storage (encrypt/decrypt)
3. `RateLimitModule` — Redis guard, check + increment per type
4. `ProvidersModule` — Gemini, Anthropic, OpenAI adapters
5. `GenerateModule` — commit, pr, branch, review-summary, release-notes, changelog endpoints
6. Web dashboard pages — register, login, dashboard, settings, connect extension
7. Extension popup — home, login fallback, settings
8. Extension content script — extract diff, inject generate button, fill output
