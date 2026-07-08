FROM node:22.13-slim AS base
RUN npm install -g pnpm@9
WORKDIR /app

# Copy workspace manifests first (better layer caching)
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json

RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm --filter api build

EXPOSE 3000
CMD pnpm --filter api migration:run && node apps/api/dist/main