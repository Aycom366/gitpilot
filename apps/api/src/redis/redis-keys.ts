export const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 7; // 7 days
export const OTT_TTL = 60; // 60 seconds

export const RedisKeys = {
  refreshToken: (token: string) => `refresh:${token}`,
  ott: (token: string) => `ott:${token}`,
  rateLimit: (userId: string, date: string, type: string) =>
    `rl:${userId}:${date}:${type}`,
};
