import { Link } from "@tanstack/react-router";

export function ByokCallout() {
  return (
    <div className='mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 flex items-center justify-between gap-4'>
      <div>
        <p className='text-sm font-semibold text-white'>
          Unlock unlimited generations
        </p>
        <p className='text-xs text-zinc-400 mt-0.5'>
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
