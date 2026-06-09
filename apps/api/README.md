# GitPilot API

NestJS backend for GitPilot. Provides auth, AI generation, and usage tracking.

## Requirements

- Node.js 20+
- pnpm
- Docker (for Postgres + Redis)

## First-time setup

```bash
# 1. Start Postgres + Redis
docker compose up -d

# 2. Configure environment
cp .env.example .env
# Fill in DATABASE_URL, JWT secrets, and any AI provider keys

# 3. Install dependencies (from monorepo root)
pnpm install

# 4. Run migrations
pnpm migration:run
```

## Running

```bash
# From monorepo root
pnpm dev:api        # http://localhost:3000

# Or from this directory
pnpm dev
```

## Migrations

```bash
# Apply all pending migrations
pnpm migration:run

# Generate a new migration after changing entities
pnpm migration:generate -- -n DescribingYourChange

# Revert the last migration
pnpm migration:revert
```

> Never use `synchronize: true`. All schema changes must go through migrations.

## Environment variables

| Variable               | Description                               |
| ---------------------- | ----------------------------------------- |
| `DATABASE_URL`         | Postgres connection string                |
| `REDIS_URL`            | Upstash Redis URL                         |
| `JWT_SECRET`           | Access token signing secret               |
| `JWT_REFRESH_SECRET`   | Refresh token signing secret              |
| `GITHUB_CLIENT_ID`     | GitHub OAuth app client ID                |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret            |
| `GEMINI_API_KEY`       | Google Gemini API key (free-tier default) |

## Tests

```bash
pnpm test          # unit tests
pnpm test:e2e      # e2e tests
pnpm test:cov      # coverage report
```
