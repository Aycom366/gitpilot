import { z } from "zod";
import type { ProviderName } from "@gitpilot/shared-types";

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type ProfileSchema = z.infer<typeof profileSchema>;

export const apiKeySchema = z.object({
  apiKey: z.string().min(10, "API key looks too short"),
});

export type ApiKeySchema = z.infer<typeof apiKeySchema>;

export const PROVIDERS: {
  value: ProviderName;
  label: string;
  description: string;
}[] = [
  {
    value: "google",
    label: "Google Gemini Flash",
    description: "Default free tier · Fast + cheap",
  },
  {
    value: "anthropic",
    label: "Anthropic Claude Haiku",
    description: "Claude Haiku 4.5 · Requires BYOK",
  },
  {
    value: "openai",
    label: "OpenAI GPT-4o mini",
    description: "GPT-4o mini · Requires BYOK",
  },
];
