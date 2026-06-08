import {
  GitCommitHorizontal,
  GitPullRequest,
  GitBranch,
  FileText,
  Tag,
  ScrollText,
} from "lucide-react";
import type { GenerationType } from "@gitpilot/shared-types";

export const GENERATION_TYPES: {
  type: GenerationType;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    type: "commit",
    label: "Commit Messages",
    icon: GitCommitHorizontal,
    description: "From staged diff",
  },
  {
    type: "pr",
    label: "PR Descriptions",
    icon: GitPullRequest,
    description: "Title + body from commits",
  },
  {
    type: "branch",
    label: "Branch Names",
    icon: GitBranch,
    description: "Slug from ticket title",
  },
  {
    type: "review-summary",
    label: "Review Summaries",
    icon: FileText,
    description: "Summarize PR changes",
  },
  {
    type: "release-notes",
    label: "Release Notes",
    icon: Tag,
    description: "From merged PRs",
  },
  {
    type: "changelog",
    label: "Changelog",
    icon: ScrollText,
    description: "Versioned change log",
  },
];
