import { Link } from "@tanstack/react-router";
import { GitCommitHorizontal } from "lucide-react";

export function Footer() {
  return (
    <footer className='border-t border-zinc-800 px-6 py-12'>
      <div className='mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row'>
        <div className='flex items-center gap-2'>
          <GitCommitHorizontal className='h-4 w-4 text-violet-400' />
          <span className='text-sm font-semibold text-white'>GitPilot</span>
          <span className='text-sm text-zinc-600'>· Open source</span>
        </div>
        <div className='flex gap-8 text-sm text-zinc-500'>
          <Link to='/privacy' className='hover:text-zinc-300 transition-colors'>
            Privacy
          </Link>
          <Link to='/terms' className='hover:text-zinc-300 transition-colors'>
            Terms
          </Link>
          <a
            href='https://github.com'
            target='_blank'
            rel='noopener noreferrer'
            className='hover:text-zinc-300 transition-colors'
          >
            GitHub
          </a>
        </div>
        <p className='text-sm text-zinc-600'>
          © {new Date().getFullYear()} GitPilot
        </p>
      </div>
    </footer>
  );
}
