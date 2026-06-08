import { QueryClient } from "@tanstack/react-query";

export const queryKeys = {
  users: {
    me: ["users", "me"] as const,
  },
  generate: {
    usage: ["generate", "usage"] as const,
  },
} as const;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});
