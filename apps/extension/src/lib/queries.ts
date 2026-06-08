import { queryOptions } from '@tanstack/react-query';
import { apiClient } from 'src/shared/api';
import type { UserProfile, UsageToday } from '@gitpilot/shared-types';

export const userQueryOptions = queryOptions<UserProfile>({
  queryKey: ['users', 'me'],
  queryFn: () => apiClient.get('/users/me'),
});

export const usageQueryOptions = queryOptions<UsageToday>({
  queryKey: ['generate', 'usage'],
  queryFn: () => apiClient.get('/generate/usage'),
});
