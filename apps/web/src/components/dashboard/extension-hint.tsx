import { Link } from "@tanstack/react-router";

export function ExtensionHint() {
  return (
    <div className='mt-4 flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5'>
      <div className='min-w-0'>
        <p className='text-sm font-semibold text-white'>
          Connect the Chrome Extension
        </p>
        <p className='mt-0.5 text-xs text-zinc-400'>
          Get ✨ buttons directly inside GitHub commit and PR pages.
        </p>
      </div>
      <Link
        to='/dashboard/settings'
        className='shrink-0 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors'
      >
        Connect →
      </Link>
    </div>
  );
}
