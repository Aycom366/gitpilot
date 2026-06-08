import { createApiHooks } from "@gitpilot/api-client";
import { apiClient } from "./api";

export const { useCreateResource, usePutResource, useDeleteResource } =
  createApiHooks(apiClient);
