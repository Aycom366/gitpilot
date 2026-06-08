import { z } from "zod";
import type { ProviderName } from "@gitpilot/shared-types";

export const apiKeySchema = z.object({
  apiKey: z.string().min(10, "Key too short"),
});

export type ApiKeySchema = z.infer<typeof apiKeySchema>;

export const PROVIDERS: { value: ProviderName; label: string }[] = [
  { value: "google", label: "Gemini Flash" },
  { value: "anthropic", label: "Claude Haiku" },
  { value: "openai", label: "GPT-4o mini" },
];
