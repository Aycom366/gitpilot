import { z } from 'zod';

export const CommitSchema = z.object({
  title: z.string().describe('Conventional commit title, max 72 chars'),
  body: z.string().optional().describe('Optional longer explanation'),
});

export const PrSchema = z.object({
  title: z.string().describe('Concise PR title'),
  description: z
    .string()
    .describe('Markdown PR body with Summary, Changes, and Testing sections'),
});

export const BranchSchema = z.object({
  branch: z.string().describe('Lowercase hyphenated branch slug, max 50 chars'),
});

export type CommitOutput = z.infer<typeof CommitSchema>;
export type PrOutput = z.infer<typeof PrSchema>;
export type BranchOutput = z.infer<typeof BranchSchema>;
