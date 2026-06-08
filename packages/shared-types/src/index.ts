export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Generation
export type GenerationType =
  | "commit"
  | "pr"
  | "branch"
  | "review-summary"
  | "release-notes"
  | "changelog";

export type ProviderName = "google" | "anthropic" | "openai";
export type Platform = "github" | "gitlab" | "bitbucket" | "jira";
export type Tier = "free" | "byok";

export interface GenerateCommitDto {
  diff: string;
  context?: string;
  provider?: ProviderName;
}

export interface GeneratePrDto {
  commits: string[];
  diff?: string;
  branch: string;
  baseBranch: string;
  provider?: ProviderName;
}

export interface GenerationResult {
  title: string;
  body?: string;
  description?: string;
  provider: ProviderName;
  model: string;
}

// Usage
export interface UsageToday {
  tier: Tier;
  limit: number;
  today: Partial<Record<GenerationType, number>>;
}

// User
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  tier: Tier;
  preferredProvider: ProviderName;
  githubUsername: string | null;
  hasApiKey: boolean;
  createdAt: string;
}
