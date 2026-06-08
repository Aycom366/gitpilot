import { queryOptions } from '@tanstack/react-query';
import { apiClient } from './api';
import { queryKeys } from './query-client';
import type { UserProfile, UsageToday } from '@gitpilot/shared-types';

export const userQueryOptions = queryOptions<UserProfile>({
  queryKey: queryKeys.users.me,
  queryFn: () => apiClient.get('/users/me'),
});

export const usageQueryOptions = queryOptions<UsageToday>({
  queryKey: queryKeys.generate.usage,
  queryFn: () => apiClient.get('/generate/usage'),
});
