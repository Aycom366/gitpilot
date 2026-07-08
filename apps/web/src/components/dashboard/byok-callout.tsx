import { Link } from "@tanstack/react-router";

export function ByokCallout() {
  return (
    <div className='mt-6 flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5'>
      <div className='min-w-0'>
        <p className='text-sm font-semibold text-white'>
          Unlock unlimited generations
        </p>
        <p className='mt-0.5 text-xs text-zinc-400'>
          Add your own API key in Settings to bypass the 10/day limit.
        </p>
      </div>
      <Link
        to='/dashboard/settings'
        className='shrink-0 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors'
      >
        Go to Settings →
      </Link>
    </div>
  );
}
