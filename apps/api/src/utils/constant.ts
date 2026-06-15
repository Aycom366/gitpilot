export const REFRESH_TTL = 60 * 60 * 24 * 7; // 7 days in seconds
export const OTT_TTL = 60; // 60 seconds
export const FREE_TIER_LIMIT = 10; // requests per day per type

export const ANALYTICS_QUEUE = 'analytics';

export const AnalyticsJobs = {
  UPSERT_USAGE: 'upsert-usage',
  LOG_GENERATION: 'log-generation',
} as const;
