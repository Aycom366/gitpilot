# GitPilot

AI-powered git context assistant — commit messages, PR descriptions, branch names, and more.

## Structure

```
apps/api        → NestJS backend
apps/web        → React web dashboard (TanStack Router + shadcn)
apps/extension  → Chrome extension (React + MV3)
packages/shared-types → Shared TypeScript types/DTOs
```

## Getting started

### Prerequisites
- Node 20+
- pnpm 9+
- Docker (for local Postgres + Redis)

### 1. Install dependencies
```bash
pnpm install
```

### 2. Start Postgres + Redis
```bash
docker compose up -d
```

### 3. Set up environment
```bash
cp apps/api/.env.example apps/api/.env
# Fill in the values in apps/api/.env
```

### 4. Run migrations
```bash
cd apps/api
pnpm migration:run
```

### 5. Start dev servers
```bash
# API
pnpm dev:api

# Web dashboard
pnpm dev:web

# Extension (watch mode)
pnpm dev:extension
```

Load the extension in Chrome: go to `chrome://extensions` → Enable Developer Mode → Load Unpacked → select `apps/extension/dist`

## Shadcn setup (first time)
```bash
# Web
cd apps/web && npx shadcn@latest init

# Extension
cd apps/extension && npx shadcn@latest init
```
