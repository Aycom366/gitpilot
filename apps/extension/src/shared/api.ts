import { createApiClient } from '@gitpilot/api-client';
import { getToken, getRefreshToken, setTokens, removeTokens } from './auth';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const apiClient = createApiClient(BASE_URL, {
  getToken,
  getRefreshToken,
  setTokens,
  removeTokens,
  // Extension popup just shows login page — no redirect needed
  onUnauthenticated: () => removeTokens(),
});
