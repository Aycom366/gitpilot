import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import type { AxiosInstance } from 'axios';

interface UseCreateResourceOptions<TResponse> {
  endpoint: string;
  queryKeyToInvalidate?: QueryKey;
  onSuccess?: (data: TResponse) => void;
}

interface UsePutResourceOptions<TResponse> {
  endpoint: string;
  queryKeyToInvalidate?: QueryKey;
  onSuccess?: (data: TResponse) => void;
}

interface UseDeleteResourceOptions<TResponse> {
  endpoint: string;
  queryKeyToInvalidate?: QueryKey;
  onSuccess?: (data: TResponse) => void;
}

export function createApiHooks(client: AxiosInstance) {
  function useCreateResource<TResponse, TData>({
    endpoint,
    queryKeyToInvalidate,
    onSuccess,
  }: UseCreateResourceOptions<TResponse>) {
    const queryClient = useQueryClient();

    return useMutation<TResponse, Error, TData>({
      mutationFn: (data: TData) => client.post(endpoint, data),
      onSuccess: (data) => {
        if (queryKeyToInvalidate) {
          void queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
        }
        onSuccess?.(data);
      },
    });
  }

  function usePutResource<TResponse, TData>({
    endpoint,
    queryKeyToInvalidate,
    onSuccess,
  }: UsePutResourceOptions<TResponse>) {
    const queryClient = useQueryClient();

    return useMutation<TResponse, Error, TData>({
      mutationFn: (data: TData) => client.put(endpoint, data),
      onSuccess: (data) => {
        if (queryKeyToInvalidate) {
          void queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
        }
        onSuccess?.(data);
      },
    });
  }

  function useDeleteResource<TResponse>({
    endpoint,
    queryKeyToInvalidate,
    onSuccess,
  }: UseDeleteResourceOptions<TResponse>) {
    const queryClient = useQueryClient();

    return useMutation<TResponse, Error, void>({
      mutationFn: () => client.delete(endpoint),
      onSuccess: (data) => {
        if (queryKeyToInvalidate) {
          void queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
        }
        onSuccess?.(data);
      },
    });
  }

  return { useCreateResource, usePutResource, useDeleteResource };
}
