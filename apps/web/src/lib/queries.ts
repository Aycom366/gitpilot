import { queryOptions, useMutation } from '@tanstack/react-query';
import { apiClient } from './api';
import { queryKeys } from './query-client';
import { removeTokens } from './auth';
import type { UserProfile, UsageToday } from '@gitpilot/shared-types';

export const userQueryOptions = queryOptions<UserProfile>({
  queryKey: queryKeys.users.me,
  queryFn: () => apiClient.get('/users/me'),
});

export const usageQueryOptions = queryOptions<UsageToday>({
  queryKey: queryKeys.generate.usage,
  queryFn: () => apiClient.get('/generate/usage'),
});

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => apiClient.delete('/users/me'),
    onSuccess: () => {
      removeTokens();
      window.location.href = '/';
    },
  });
}
