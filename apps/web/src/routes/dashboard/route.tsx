import { useState } from "react";
import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { GitCommitHorizontal, Menu } from "lucide-react";
import { isLoggedIn } from "../../lib/auth";
import { Sidebar } from "../../components/dashboard/sidebar";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    if (!isLoggedIn()) throw redirect({ to: "/auth/login" });
  },
  component: DashboardRouteLayout,
});

function DashboardRouteLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className='h-svh bg-zinc-950 flex overflow-hidden'>
      <Sidebar
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <header className='flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 md:hidden'>
          <button
            type='button'
            aria-label='Open navigation menu'
            onClick={() => setMobileNavOpen(true)}
            className='rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors'
          >
            <Menu className='h-5 w-5' />
          </button>
          <Link to='/' className='flex items-center gap-2'>
            <GitCommitHorizontal className='h-5 w-5 text-violet-400' />
            <span className='text-base font-bold text-white'>GitPilot</span>
          </Link>
          <div className='w-9' aria-hidden='true' />
        </header>

        <main className='flex-1 overflow-auto'>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
