import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { GitCommitHorizontal } from "lucide-react";
import { isLoggedIn } from "../../lib/auth";

export const Route = createFileRoute("/auth")({
  beforeLoad: () => {
    if (isLoggedIn()) throw redirect({ to: "/dashboard" });
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className='min-h-screen bg-zinc-950 flex'>
      {/* Left panel — branding */}
      <div className='hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-zinc-900 to-zinc-950 border-r border-zinc-800'>
        <div className='flex items-center gap-2'>
          <GitCommitHorizontal className='h-5 w-5 text-violet-400' />
          <span className='text-lg font-bold text-white'>GitPilot</span>
        </div>
        <div>
          <blockquote className='text-2xl font-semibold text-white leading-relaxed'>
            "I stopped writing 'fix stuff' commits the day I installed
            GitPilot."
          </blockquote>
          <p className='mt-4 text-zinc-400 text-sm'>
            — A developer with better commit hygiene
          </p>
        </div>
        <div className='space-y-3'>
          {[
            "10 free generations per day",
            "Commit messages, PR descriptions & branch names",
            "Open source · No credit card required",
          ].map((item) => (
            <div
              key={item}
              className='flex items-center gap-2 text-sm text-zinc-400'
            >
              <div className='h-1.5 w-1.5 rounded-full bg-violet-400' />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className='flex flex-1 flex-col items-center justify-center px-6 py-12'>
        <div className='w-full max-w-sm'>
          <div className='mb-8 flex items-center gap-2 lg:hidden'>
            <GitCommitHorizontal className='h-5 w-5 text-violet-400' />
            <span className='text-lg font-bold text-white'>GitPilot</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
