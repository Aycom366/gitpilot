import { Link } from "@tanstack/react-router";

export function ExtensionHint() {
  return (
    <div className='mt-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 flex items-center justify-between gap-4'>
      <div>
        <p className='text-sm font-semibold text-white'>
          Connect the Chrome Extension
        </p>
        <p className='text-xs text-zinc-400 mt-0.5'>
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
