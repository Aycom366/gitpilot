# GitPilot — Claude Context

## What this project is

A browser extension + web dashboard that acts as a **git context assistant** — generates commit messages, PR titles/descriptions, branch names, code review summaries, release notes, and changelog entries using AI.

## Monorepo structure

```
apps/api                  → NestJS backend (TypeScript)
apps/web                  → React web dashboard (Vite + TanStack Router + shadcn/ui)
apps/extension            → Chrome extension MV3 (React + Vite + shadcn/ui)
packages/shared-types     → Shared TypeScript DTOs used across all apps
packages/api-client       → Shared axios client + TanStack Query hooks factory
```

## Tech stack

- **Backend**: NestJS, TypeORM, PostgreSQL, Redis (Upstash), Passport.js, JWT
- **Frontend**: React 19, TanStack Router, TanStack Query, shadcn/ui, Tailwind CSS
- **AI Providers**: Google Gemini Flash (default free tier), Anthropic Claude Haiku, OpenAI GPT-4o mini
- **Package manager**: pnpm workspaces

---

## Key conventions

### Backend (`apps/api`)

- **Never** use `synchronize: true` — all DB changes go through TypeORM migrations
- Generate migration: `pnpm migration:generate -- -n MigrationName` (from `apps/api`)
- Run migrations: `pnpm migration:run` (from `apps/api`)
- Entities: `src/{module}/{entity}.entity.ts`
- DTOs: `src/{module}/dto/` using `class-validator` decorators
- Modules follow standard NestJS structure: `*.module.ts`, `*.controller.ts`, `*.service.ts`
- Rate limiting: Redis key `rl:{userId}:{YYYY-MM-DD}:{type}` — per-user, per-day, per generation type
- BYOK users bypass rate limiting entirely
- `generation_history` stores analytics metadata only (no raw diffs or output)
- Provider keys encrypted with AES-256-GCM → `users.encryptedApiKey` + `users.apiKeyIv`

### Frontend — web (`apps/web`) and extension popup (`apps/extension/src/`)

- File-based routing via **TanStack Router** — routes in `src/routes/`
- UI components from **shadcn/ui**: `npx shadcn@latest add <component>`
- Shared types imported from `@gitpilot/shared-types`
- API calls via `src/lib/api.ts` (axios instance with JWT interceptor + auto-refresh)
- Web app uses `@gitpilot/api-client` (`packages/api-client`) for typed query hooks

### Extension-specific (`apps/extension`)

- JWT stored in `chrome.storage.local` via `src/shared/auth.ts` — **never** `localStorage`
- Content scripts in `src/content/` — built as IIFE bundles by `vite.config.ts`
- **Two-world architecture for Azure DevOps**:
  - `azure-main.ts` runs in `world: "MAIN"` (page JS context) — can access `window.monaco`
  - `azure.ts` runs in isolated world (default) — can use `chrome.runtime`
  - They communicate via `window.postMessage` with `GITPILOT_READ_MONACO` / `GITPILOT_MONACO_RESULT` messages
- `github.ts` runs in isolated world — uses in-memory diff (captures original content at page load via `.cm-line`, diffs on generate)
- `src/content/shared.ts` exports utilities: `makeButton`, `setButtonState`, `showError`, `sendToBackground`, `setNativeValue`, `computeUnifiedDiff`
- `computeUnifiedDiff` — LCS-based unified diff, capped at 600 lines, outputs standard `--- a/` / `+++ b/` format with 3 lines of context
- Adding a new content script: add entry to the `for` loop in `vite.config.ts`, add to `manifest.json`

### Build

```bash
cd apps/extension
pnpm build        # builds popup (React), content scripts (IIFE), service worker (ESM), writes dist/manifest.json
```

The `extensionPlugin` in `vite.config.ts` runs after the main popup build and compiles each content script separately. The manifest paths are rewritten to flat filenames (e.g. `azure.js`, `github.js`, `azure-main.js`).

---

## Auth flow

Three paths, same JWT pair output:

1. **Email/password** — `POST /auth/register` or `POST /auth/login`
2. **GitHub OAuth** — optional shortcut on register/login page
3. **OTT extension link** — logged-in web user clicks "Connect Extension" → `POST /auth/extension-token` → deep link `gitpilot://auth?token=...` → extension service worker exchanges via `POST /auth/exchange` → stores JWT in `chrome.storage.local`

---

## Generation types

`commit` | `pr` | `branch` | `review-summary` | `release-notes` | `changelog`

Each type has its own rate limit counter. Free tier: 10 req/day per type.

---

## AI provider routing

- Free users → Gemini Flash by default (cheapest)
- BYOK users → their encrypted API key + preferred provider (Gemini / Claude / OpenAI)

---

## Environment

Copy `apps/api/.env.example` → `apps/api/.env` and fill in values.
Local dev requires Docker: `docker compose up -d` (Postgres 16 + Redis 7).

## Running locally

```bash
pnpm install
docker compose up -d
cd apps/api && pnpm migration:run
pnpm dev:api        # http://localhost:3000
pnpm dev:web        # http://localhost:5173
pnpm dev:extension  # watch mode → dist/ (load unpacked in Chrome)
```

---

## What's built

### Extension (`apps/extension`) — complete

- `manifest.json` — MV3, host_permissions for github.com + dev.azure.com, scripting permission
- `src/background/service-worker.ts` — OTT exchange, routes `GENERATE_*` messages to API, handles token refresh
- `src/shared/auth.ts` — JWT read/write in `chrome.storage.local`
- `src/content/shared.ts` — shared utilities (button, error, diff, postMessage helpers)
- `src/content/github.ts` — GitHub commit modal button + PR page button; in-memory diff via CodeMirror `.cm-line`; MutationObservers for both commit modal and PR button re-injection (GitHub React re-renders on auto-populate)
- `src/content/azure-main.ts` — MAIN world; reads Monaco models (`window.monaco.editor.getModels()`), polls until original ≠ modified, responds via postMessage
- `src/content/azure.ts` — isolated world; injects commit panel "Generate message" button, tab-switches to "Highlight changes" to trigger Monaco diff editor, requests model values from azure-main via postMessage, computes diff, fills textarea
- Popup (`src/popup/`) — React app with login, home (shows plan/usage), settings (BYOK key)
- `auth-callback.html` — handles the `gitpilot://` deep link redirect

### Web dashboard (`apps/web`) — partially scaffolded

- Root layout + landing page
- `/dashboard` route — usage stats, connect extension button
- `/settings` route — BYOK key management
- `DashboardLayout` component with sidebar nav
- `src/lib/api.ts` — axios instance with JWT interceptor + silent refresh
- `src/lib/queries.ts` — TanStack Query hooks (useProfile, useUsage)

### Shared packages

- `packages/shared-types` — `UserProfile`, `UsageStats`, `GenerateRequest`, `GenerateResponse` DTOs
- `packages/api-client` — `createApiClient(baseUrl)` factory, `createApiHooks(client)` TanStack Query factory

### Backend (`apps/api`) — entities + config only

- `User` entity — id, email, passwordHash, githubId, plan, encryptedApiKey, apiKeyIv, preferredProvider
- `UsageDaily` entity — userId, date, type, count
- `GenerationHistory` entity — userId, type, provider, promptTokens, completionTokens, createdAt
- `AIProvider` interface — `src/providers/provider.interface.ts`
- `data-source.ts` — TypeORM CLI migration config
- ConfigModule wired in AppModule

---

## TODO (build in this order)

### Backend

1. **`AuthModule`** — endpoints: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `GET /auth/github`, `GET /auth/github/callback`, `POST /auth/extension-token`, `POST /auth/exchange`
2. **`UsersModule`** — `GET /users/me`, `PATCH /users/me`, `POST /users/byok` (encrypt + store key)
3. **`RateLimitModule`** — Redis guard that checks + increments `rl:{userId}:{date}:{type}`; skip for BYOK
4. **`ProvidersModule`** — adapters for Gemini Flash, Claude Haiku, GPT-4o mini; each implements `AIProvider`
5. **`GenerateModule`** — one controller with endpoints for each generation type; applies rate limit guard; routes to correct provider

### Web dashboard

6. Register + login pages (email/password + GitHub OAuth button)
7. Wire "Connect Extension" button → calls `POST /auth/extension-token`, opens deep link

### Extension

8. All API-facing flows already wired in service worker — unblock by shipping the backend

---

## Common gotchas

- **TypeScript `baseUrl` deprecation**: `tsconfig.app.json` has `"ignoreDeprecations": "6.0"` to suppress TS5101
- **Content script world**: azure.ts must stay in isolated world (needs `chrome.runtime`); azure-main.ts must stay in MAIN world (needs `window.monaco`). Do not merge them.
- **Monaco model URIs**: original file from git has numeric URI `inmemory://model/<number>`; modified has `inmemory://model/git/.../filename`. The `isOrig` regex `/inmemory:\/\/model\/\d+$/` identifies the original.
- **Extension build**: content scripts are built as IIFE (not ESM) so they have no imports at runtime. All dependencies are inlined via the Vite build.
- **Migration CLI**: must run from `apps/api` directory, not monorepo root.
- **pnpm workspaces**: always run `pnpm install` from the root; individual `cd apps/X && pnpm install` will break workspace linking.
