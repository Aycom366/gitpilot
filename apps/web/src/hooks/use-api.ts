import { createApiHooks } from "@gitpilot/api-client";
import { apiClient } from "../lib/api";

export const { useCreateResource, usePutResource, useDeleteResource } =
  createApiHooks(apiClient);
