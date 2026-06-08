import { Link, useRouterState } from "@tanstack/react-router";
import { GitCommitHorizontal, LayoutDashboard, Settings } from "lucide-react";
import { cn } from "@gitpilot/ui";

const navItems = [
  { to: "/" as const, icon: LayoutDashboard, title: "Home" },
  { to: "/settings" as const, icon: Settings, title: "Settings" },
];

export function PopupHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className='flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900'>
      <div className='flex items-center gap-2'>
        <GitCommitHorizontal className='h-4 w-4 text-violet-400' />
        <span className='text-sm font-bold text-white'>GitPilot</span>
      </div>
      <div className='flex items-center gap-1'>
        {navItems.map(({ to, icon: Icon, title }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              pathname === to
                ? "text-violet-400 bg-violet-600/15"
                : "text-zinc-500 hover:text-zinc-300",
            )}
            title={title}
          >
            <Icon className='h-4 w-4' />
          </Link>
        ))}
      </div>
    </header>
  );
}
