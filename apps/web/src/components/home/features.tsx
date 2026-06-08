import { Badge } from "@gitpilot/ui";
import {
  GitCommitHorizontal,
  GitPullRequest,
  GitBranch,
  Zap,
  Shield,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: GitCommitHorizontal,
    title: "Commit Messages",
    description:
      'Paste your diff and get a Conventional Commits-formatted message with title and body. No more "fix stuff" commits.',
  },
  {
    icon: GitPullRequest,
    title: "PR Descriptions",
    description:
      "Turn a list of commits into a structured PR description with Summary, Changes, and Testing sections.",
  },
  {
    icon: GitBranch,
    title: "Branch Names",
    description:
      "Paste a ticket title and get a clean hyphenated slug. Optionally prefix with your ticket ID automatically.",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description:
      "Powered by Gemini Flash by default. Fast enough that it feels like autocomplete, not a waiting game.",
  },
  {
    icon: Shield,
    title: "Bring Your Own Key",
    description:
      "Use your own API key for unlimited requests. Keys are encrypted at rest — we never log or expose them.",
  },
  {
    icon: Globe,
    title: "Multi-Provider",
    description:
      "Choose between Google Gemini, Anthropic Claude, or OpenAI. Switch any time from settings.",
  },
];

export function Features() {
  return (
    <section id='features' className='px-6 py-24'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-16 text-center'>
          <Badge className='mb-4'>Features</Badge>
          <h2 className='text-4xl font-bold text-white'>
            Everything your git workflow needs
          </h2>
          <p className='mt-4 text-zinc-400'>
            Stop spending time writing boilerplate. Focus on the code.
          </p>
        </div>

        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {features.map((feature) => (
            <div
              key={feature.title}
              className='rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 transition-colors hover:border-zinc-700 hover:bg-zinc-900'
            >
              <div className='mb-4 inline-flex rounded-lg bg-violet-600/10 p-2.5'>
                <feature.icon className='h-5 w-5 text-violet-400' />
              </div>
              <h3 className='mb-2 font-semibold text-white'>{feature.title}</h3>
              <p className='text-sm text-zinc-400 leading-relaxed'>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
