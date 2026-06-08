# GitPilot — Project Handoff

This document is the complete context needed to continue building GitPilot with any LLM.

---

## What is GitPilot?

A **git context assistant** — a Chrome extension + web dashboard that generates:
- Commit messages (from staged diff)
- PR titles + descriptions (from branch commits/diff)
- Branch name slugs (from ticket titles)
- (v2) Review summaries, release notes, changelogs

**Business model:** Free (20 req/day per type via platform AI) + BYOK (unlimited, user's own API key).
**Stack:** NestJS backend + React web dashboard + React Chrome extension (MV3). Open source.

---

## Monorepo Structure

```
gitpilot/
├── apps/
│   ├── api/          NestJS backend
│   ├── web/          React web dashboard (Vite + TanStack Router)
│   └── extension/    Chrome extension MV3 (React + Vite)
├── packages/
│   ├── shared-types/ TypeScript DTOs shared across all apps
│   └── ui/           Shared React component library (Button, Badge, FormInput, etc.)
├── docker-compose.yml  Postgres 16 + Redis 7
└── pnpm-workspace.yaml
```

Package manager: **pnpm workspaces**. Run `pnpm install` from root.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Backend | NestJS + TypeScript |
| ORM | TypeORM (`@nestjs/typeorm`) — entities in `src/database/models/` |
| Database | PostgreSQL (migrations only, never `synchronize: true`) |
| Cache / Rate limiting | Redis (Upstash in prod, local Docker in dev) |
| Queue | BullMQ (`@nestjs/bullmq`) — uses same Redis connection |
| Auth | Passport.js (local + GitHub OAuth) + JWT |
| AI | Vercel AI SDK (`ai`, `@ai-sdk/google`, `@ai-sdk/anthropic`, `@ai-sdk/openai`) |
| Web frontend | React 19 + Vite + TanStack Router (file-based) + TanStack Query |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite` plugin) |
| Forms | React Hook Form + Zod + `@hookform/resolvers` |
| Toasts | Sonner |
| Fonts | Montserrat (Google Fonts, loaded in `index.html`) |
| Token storage | `js-cookie` (web), `chrome.storage.local` (extension) |
| Extension link | One-time token (OTT) flow — web generates, extension exchanges |

---

## Environment Setup

```bash
# 1. Install deps
pnpm install

# 2. Copy and fill env
cp apps/api/.env.example apps/api/.env

# 3. Start Postgres + Redis
docker compose up -d

# 4. Generate and run first migration
cd apps/api
pnpm migration:generate -- -n InitialSchema
pnpm migration:run

# 5. Dev servers
pnpm dev:api        # NestJS on :3000
pnpm dev:web        # Vite on :5173
pnpm dev:extension  # Watch build → dist/
```

---

## Backend Architecture

### Module structure (`apps/api/src/`)

```
app.module.ts          Root module
config.ts              Flat config object from env (NOT NestJS ConfigService)
main.ts                ValidationPipe (global), CORS, shutdown hooks

database/
  database.module.ts   @Global — registers all TypeORM entities + exports TypeOrmModule
  data-source.ts       TypeORM CLI data source (used by migration scripts)
  models/
    user.entity.ts
    usage-daily.entity.ts
    generation-history.entity.ts

redis/
  redis.module.ts      @Global
  redis.service.ts     Thin wrapper around ioredis (get/set/del/incr/expire/ttl)

queue/
  queue.module.ts      BullMQ setup — registers ANALYTICS_QUEUE
  analytics.processor.ts  Handles UPSERT_USAGE + LOG_GENERATION jobs
  queue.constants.ts   ANALYTICS_QUEUE, AnalyticsJobs enum

auth/
  auth.module.ts
  auth.controller.ts
  auth.service.ts
  dto/                 register, login, refresh, exchange-ott
  guards/              jwt-auth, local-auth, github-auth
  strategies/          local, jwt, github

users/
  users.module.ts
  users.controller.ts  GET/PUT /users/me, PUT /users/me/provider, DELETE /users/me/api-key
  users.service.ts     CRUD + saveApiKey (AES-256-GCM encrypt) + decryptApiKey

generate/
  generate.module.ts
  generate.controller.ts  POST /generate/commit|pr|branch, GET /generate/usage
  generate.service.ts     Owns Zod schemas + generateObject calls
  schemas.ts              CommitSchema, PrSchema, BranchSchema (Zod)
  dto/                    generate-commit, generate-pr, generate-branch

providers/
  provider.interface.ts   AIProvider interface — getModel(apiKey?) → AIModel
  google.provider.ts      Gemini 1.5 Flash (default free tier)
  anthropic.provider.ts   Claude Haiku 4.5
  openai.provider.ts      GPT-4o mini
  providers.module.ts

rate-limit/
  rate-limit.module.ts
  rate-limit.service.ts   Redis key: rl:{userId}:{YYYY-MM-DD}:{type}, free limit 20/day

common/
  exceptions/
    rate-limit.exception.ts  RateLimitExceededException (429)

utils/
  constant.ts   REFRESH_TTL, OTT_TTL, FREE_TIER_LIMIT, ANALYTICS_QUEUE, AnalyticsJobs
  crypto.ts     encrypt/decrypt (AES-256-GCM) for BYOK keys
```

### Key backend patterns

**Config pattern** — flat object from env, not NestJS ConfigService:
```typescript
// src/config.ts
import 'dotenv/config';
export const config = {
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  // ...
};
```

**Entities** — all in `src/database/models/`, registered once in `DatabaseModule` (`@Global`). Any module can `@InjectRepository(Entity)` without importing DatabaseModule.

**Migrations** — always use migrations, never `synchronize: true` even locally:
```bash
pnpm migration:generate -- -n MigrationName   # from apps/api/
pnpm migration:run
```

**Provider pattern** — provider just returns a model instance. Generate service owns schemas + calls:
```typescript
// Provider only does this:
getModel(apiKey?: string): AIModel {
  const google = createGoogleGenerativeAI({ apiKey: apiKey ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY });
  return google(this.modelId);
}

// Generate service owns everything else:
const { object, usage } = await generateObject({
  model: this.resolveProvider(user, dto.provider).model,
  schema: CommitSchema,   // ← Zod schema lives HERE
  system: '...',
  prompt: '...',
});
```

**Queue for non-critical writes** — never await DB writes that don't affect the response:
```typescript
// fire-and-forget via BullMQ
void this.analyticsQueue.add(AnalyticsJobs.LOG_GENERATION, { ... });
```

**BYOK encryption** — AES-256-GCM, stored as `encrypted:authTag` + separate IV column:
- `user.encryptedApiKey` = `"hexEncrypted:hexAuthTag"`
- `user.apiKeyIv` = hex IV
- `UsersService.decryptApiKey(user)` returns plaintext or null

**Auth endpoints:**
```
POST /auth/register           { name, email, password } → { accessToken, refreshToken }
POST /auth/login              { email, password } → { accessToken, refreshToken }
GET  /auth/github             Redirect to GitHub OAuth
GET  /auth/github/callback    GitHub redirects here → backend redirects to WEB_URL/auth/callback?accessToken=...
POST /auth/refresh            { refreshToken } → new tokens (refresh rotation)
POST /auth/logout             { refreshToken } → revoke
POST /auth/extension-token    (JWT required) → { ott, deepLink }  — OTT for linking extension
POST /auth/exchange           { ott } → { accessToken, refreshToken }  — extension exchanges OTT
```

---

## Web Frontend Architecture

### File structure (`apps/web/src/`)

```
main.tsx          QueryClientProvider + Toaster + ReactQueryDevtools + App
App.tsx           RouterProvider with queryClient in context
index.css         @import "tailwindcss" + @source for packages/ui/src
index.html        Montserrat font loaded here

lib/
  query-client.ts  QueryClient singleton (5min staleTime, retry 2)
  api.ts           axios instance + request/response interceptors
  auth.ts          setTokens, getToken, getRefreshToken, removeTokens, isLoggedIn
  utils.ts         parseError(error) → string

hooks/
  use-api.ts       useCreateResource<TRes, TData>, usePutResource, useDeleteResource

routes/
  __root.tsx       createRootRouteWithContext<{ queryClient: QueryClient }>()
  index.tsx        Landing page (/)
  login.tsx        Redirect /login → /auth/login
  register.tsx     Redirect /register → /auth/register
  dashboard.tsx    Stub with beforeLoad auth guard
  auth/
    route.tsx      Layout (two-panel) + beforeLoad redirect-if-logged-in
    login.tsx      Login page
    register.tsx   Register page
    callback.tsx   GitHub OAuth callback handler
```

### Web coding patterns (from jeun-web reference)

**API mutations — always `useCreateResource`:**
```typescript
const mutation = useCreateResource<ResponseType, PayloadType>({
  endpoint: '/auth/login',
});

mutation.mutate(values, {
  onSuccess: (data) => {
    toast.success('Message');
    void navigate({ to: '/dashboard' });
  },
  onError: (error) => {
    toast.error(parseError(error));
  },
});
```

**Forms — React Hook Form + Zod + FormProvider:**
```typescript
const form = useForm<ISchema>({
  resolver: zodResolver(schema),
  mode: 'onBlur',
});

// Form wraps in FormProvider, button references form by id
<FormProvider {...form}>
  <form id="my-form" onSubmit={form.handleSubmit(onSubmit)}>
    <FormInput<ISchema> name="email" label="Email" type="email" />
  </form>
</FormProvider>
<Button form="my-form" type="submit" disabled={mutation.isPending}>
  Submit
</Button>
```

**Route guards:**
```typescript
// Protect route if not logged in
beforeLoad: () => {
  if (!isLoggedIn()) throw redirect({ to: '/auth/login' });
}

// Redirect if already logged in (auth pages)
beforeLoad: () => {
  if (isLoggedIn()) throw redirect({ to: '/dashboard' });
}
```

**Token storage:** `js-cookie` (not localStorage). Access token: 1 day, refresh token: 7 days.

**Tailwind v4:** Uses `@tailwindcss/vite` plugin (NOT PostCSS). `@import "tailwindcss"` in CSS. `@source` directive to scan `packages/ui/src`.

**Shared UI components (`@gitpilot/ui`):**
- `Button` — variants: `default`, `outline`, `ghost`, `link`. Sizes: `sm`, `md`, `lg`
- `Badge` — variants: `default`, `outline`
- `FormInput<T>` — generic, reads from `useFormContext`, shows validation error
- `cn()` — `clsx` + `tailwind-merge`

**GitHub OAuth button** — plain `<a href="${API_URL}/auth/github">` tag, no fetch needed. Backend handles the full redirect chain and lands on `/auth/callback?accessToken=...`.

---

## Database Schema (TypeORM entities)

### `users`
```typescript
id, name, email, passwordHash (nullable), githubId (nullable), githubUsername,
tier: 'free' | 'byok', preferredProvider: 'google' | 'anthropic' | 'openai',
encryptedApiKey (nullable, format: "hexData:hexAuthTag"), apiKeyIv (nullable),
createdAt, updatedAt
```

### `usage_daily`
```typescript
id, user (FK), date (YYYY-MM-DD), type (GenerationType), requestCount
UNIQUE: (user, date, type)   ← separate limit per generation type per day
```

### `generation_history` (analytics only — no content stored)
```typescript
id, user (FK), type, provider, model, inputTokens, outputTokens, platform, createdAt
```

---

## Rate Limiting

Redis key: `rl:{userId}:{YYYY-MM-DD}:{type}`
- Increment on each request via `redis.incr(key)`
- TTL set to seconds until midnight UTC on first increment
- Free limit: **20 requests/day per generation type** (commit, pr, branch, etc.)
- BYOK users: **skip entirely**
- DB upsert to `usage_daily` fires via BullMQ queue (non-critical, fire-and-forget)

---

## Extension Architecture

The extension links to a user's web account via **OTT (one-time token) flow**:
1. Logged-in web user clicks "Connect Extension"
2. Web calls `POST /auth/extension-token` → gets `{ ott, deepLink }`
3. Web opens `chrome-extension://{id}/auth-callback.html?ott=abc123`
4. Extension service worker calls `POST /auth/exchange { ott }` → gets JWT pair
5. Extension stores JWT in `chrome.storage.local`
6. OTT is single-use and expires in 60 seconds

Extension also has a fallback manual login form in the popup for users who install before visiting the web dashboard.

---

## ✅ Done

### Backend (complete for v1)
- [x] NestJS app with TypeORM + Postgres
- [x] DatabaseModule (`@Global`) with all 3 entities
- [x] RedisModule (`@Global`) with ioredis wrapper
- [x] QueueModule (BullMQ) — analytics processor for usage + history writes
- [x] AuthModule — register, login, GitHub OAuth, refresh (with rotation), logout, OTT flow
- [x] UsersModule — profile CRUD, BYOK key encryption/storage, provider preference
- [x] RateLimitModule — per-user per-type per-day Redis counters
- [x] ProvidersModule — Google, Anthropic, OpenAI adapters via Vercel AI SDK
- [x] GenerateModule — commit, PR, branch endpoints with Zod schemas + generateObject
- [x] `src/common/exceptions/rate-limit.exception.ts` — custom 429 exception
- [x] `src/utils/constant.ts` — shared constants
- [x] `src/utils/crypto.ts` — AES-256-GCM encrypt/decrypt
- [x] `src/config.ts` — flat env config object
- [x] `docker-compose.yml` — Postgres + Redis
- [x] `.env.example` — all required variables documented

### Web Dashboard
- [x] Vite + React 19 + TanStack Router (file-based, auto-generates routeTree)
- [x] Tailwind v4 via `@tailwindcss/vite` + Montserrat font
- [x] QueryClientProvider + ReactQueryDevtools + Sonner toaster
- [x] `lib/api.ts` — axios with JWT interceptor + auto-refresh
- [x] `lib/auth.ts` — cookie-based token management
- [x] `lib/utils.ts` — `parseError`
- [x] `lib/query-client.ts` — QueryClient singleton
- [x] `hooks/use-api.ts` — `useCreateResource`, `usePutResource`, `useDeleteResource`
- [x] Landing page — hero, features, how it works, pricing, CTA, footer
- [x] Auth layout (`/auth/route.tsx`) — two-panel, branding left + form right
- [x] Login page — email/password + Continue with GitHub
- [x] Register page — name/email/password + Continue with GitHub
- [x] `/auth/callback` — handles GitHub OAuth redirect, extracts tokens
- [x] `@gitpilot/ui` — Button, Badge, FormInput, cn()

### Architecture + Docs
- [x] `gitpilot-architecture.md` — full system design
- [x] `CLAUDE.md` — project context for IDE Claude sessions
- [x] `README.md` — setup instructions

---

## ❌ Not yet built

### Web Dashboard
- [ ] Dashboard page — usage stats (today's counts per type), generation history
- [ ] Settings page — update name, change provider, BYOK key input, "Connect Extension" button
- [ ] User query — `GET /users/me` hook (`useQuery` + `queryOptions`)
- [ ] Usage query — `GET /generate/usage` hook
- [ ] Auth callback page for `/auth/callback` route (TanStack search params)

### Extension
- [ ] Popup: Home page (usage counter, tier badge)
- [ ] Popup: Login fallback (email/password, same FormInput pattern as web)
- [ ] Popup: Settings (provider picker, BYOK input)
- [ ] Content script: detect GitHub commit page → inject ✨ button → fill input with result
- [ ] Content script: detect GitHub PR creation page → inject ✨ button → fill title + description
- [ ] `auth-callback.html` — receives OTT deep link, calls `POST /auth/exchange`
- [ ] Service worker: handle OTT exchange, store tokens in `chrome.storage.local`

### Backend
- [ ] First migration generated and committed (`pnpm migration:generate`)
- [ ] `GET /generate/usage` response type aligned with `UsageToday` from shared-types

### Infra
- [ ] Deploy API to Railway/Render
- [ ] Add `VITE_API_URL` env to web deployment
- [ ] Chrome Web Store submission

---

## Key Files to Read First

When picking this up, read these in order:
1. `CLAUDE.md` — full conventions and build order
2. `apps/api/src/config.ts` — env variables in use
3. `apps/api/src/database/models/user.entity.ts` — the central entity
4. `apps/api/src/generate/generate.service.ts` — the core generation logic
5. `apps/web/src/hooks/use-api.ts` — how API calls are made
6. `apps/web/src/routes/auth/login.tsx` — the established page pattern

---

## Important Conventions to Maintain

1. **Never `synchronize: true`** in TypeORM — always run migrations
2. **Never store diffs or generated output** in DB — analytics metadata only
3. **Provider pattern** — provider = model factory only. Generate service owns schemas + calls
4. **Non-critical writes go to queue** — `void queue.add(...)`, never await
5. **config.ts not ConfigService** — all env access via `import { config } from 'src/config'`
6. **Entity imports** — always from `../database/models/*.entity`
7. **Forms** — `useForm` + `FormProvider` + `FormInput<T>` from `@gitpilot/ui`
8. **API calls** — always `useCreateResource` / `usePutResource` / `useDeleteResource`
9. **Route protection** — `beforeLoad` with `isLoggedIn()` check
10. **Tailwind v4** — `@tailwindcss/vite` plugin, no PostCSS, `@source` for ui package
