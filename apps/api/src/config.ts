import 'dotenv/config';

export const config = {
  port: process.env.PORT ?? 3000,
  databaseUrl: process.env.DATABASE_URL!,
  redisUrl: process.env.REDIS_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN as
    | `${number}${'s' | 'm' | 'h' | 'd'}`
    | undefined,
  githubClientId: process.env.GITHUB_CLIENT_ID!,
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET!,
  githubCallbackUrl: process.env.GITHUB_CALLBACK_URL!,
  // Vercel AI SDK reads these env vars automatically by convention:
  // ANTHROPIC_API_KEY, OPENAI_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY
  // Only needed here if you want to pass BYOK keys at runtime
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  googleApiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  encryptionKey: process.env.ENCRYPTION_KEY,
  extensionId: process.env.EXTENSION_ID!,
  webUrl: process.env.WEB_URL!,
  bullBoardUser: process.env.BULL_BOARD_USER!,
  bullBoardPassword: process.env.BULL_BOARD_PASSWORD!,
  sentryDsn: process.env.SENTRY_DSN!,
};
