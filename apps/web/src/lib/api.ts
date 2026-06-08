import { createApiClient } from '@gitpilot/api-client';
import { getToken, getRefreshToken, setTokens, removeTokens } from './auth';

export const apiClient = createApiClient(
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  {
    getToken,
    getRefreshToken,
    setTokens,
    removeTokens,
    onUnauthenticated: () => {
      window.location.href = '/auth/login';
    },
  },
);
