import { Button, Badge } from "@gitpilot/ui";
import { ChevronRight, Star, Chrome } from "lucide-react";

export function Hero() {
  return (
    <section className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-32 pb-16 text-center'>
      <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
        <div className='h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[120px]' />
      </div>

      <Badge className='mb-6'>
        <Star className='mr-1 h-3 w-3' /> Open source &amp; free forever
      </Badge>

      <h1 className='max-w-3xl text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl'>
        Write better git messages,{" "}
        <span className='bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent'>
          automatically
        </span>
      </h1>

      <p className='mt-6 max-w-xl text-lg text-zinc-400'>
        GitPilot is a browser extension that generates commit messages, PR
        descriptions, and branch names from your diffs using AI. Free to use,
        open source, no credit card required.
      </p>

      <div className='mt-10 flex flex-col items-center gap-4 sm:flex-row'>
        <Button size='lg' className='gap-2'>
          <Chrome className='h-4 w-4' />
          Add to Chrome — it's free
        </Button>
        <a
          href='https://github.com/aycom3/gitpilot'
          target='_blank'
          rel='noopener noreferrer'
        >
          <Button variant='outline' size='lg' className='gap-2'>
            View on GitHub
            <ChevronRight className='h-4 w-4' />
          </Button>
        </a>
      </div>

      <p className='mt-4 text-sm text-zinc-600'>
        20 free generations per day · No credit card required
      </p>

      <div className='mt-16 w-full max-w-2xl overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 text-left shadow-2xl shadow-violet-950/30'>
        <div className='flex items-center gap-2 border-b border-zinc-800 px-4 py-3'>
          <div className='h-3 w-3 rounded-full bg-red-500/70' />
          <div className='h-3 w-3 rounded-full bg-yellow-500/70' />
          <div className='h-3 w-3 rounded-full bg-green-500/70' />
          <span className='ml-2 text-xs text-zinc-500'>
            GitPilot — commit message
          </span>
        </div>
        <div className='p-5 font-mono text-sm'>
          <p className='text-zinc-500'>{"// Your staged diff"}</p>
          <p className='mt-2 text-zinc-400'>
            <span className='text-green-400'>+</span> export async function
            generateCommit(diff: string) {"{"} ... {"}"}
          </p>
          <div className='mt-4 border-t border-zinc-800 pt-4'>
            <p className='text-violet-400'>✨ Generated commit message</p>
            <p className='mt-2 text-white'>
              feat(generate): add AI-powered commit message endpoint
            </p>
            <p className='mt-1 text-zinc-400 text-xs'>
              Implements POST /generate/commit that accepts a git diff and
              returns a Conventional Commits-formatted message using the
              configured AI provider.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
