import { Link, useNavigate } from "@tanstack/react-router";
import {
  GitCommitHorizontal,
  LayoutDashboard,
  Settings,
  LogOut,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getRefreshToken, removeTokens } from "../../lib/auth";
import { useCreateResource } from "../../hooks/use-api";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logoutMutation = useCreateResource<void, { refreshToken: string }>({
    endpoint: "/auth/logout",
  });

  function handleLogout() {
    const refreshToken = getRefreshToken();
    logoutMutation.mutate(
      { refreshToken },
      {
        onSuccess: () => {
          removeTokens();
          queryClient.clear();
          void navigate({ to: "/auth/login" });
        },
        onError: () => {
          removeTokens();
          queryClient.clear();
          void navigate({ to: "/auth/login" });
        },
      },
    );
  }

  return (
    <aside className='w-60 shrink-0 flex flex-col bg-zinc-900 border-r border-zinc-800'>
      <Link
        to='/'
        className='h-16 flex items-center gap-2 px-5 border-b border-zinc-800'
      >
        <GitCommitHorizontal className='h-5 w-5 text-violet-400' />
        <span className='text-lg font-bold text-white'>GitPilot</span>
      </Link>

      <nav className='flex-1 py-4 px-3 space-y-1'>
        {navItems.map(({ to, label, icon: Icon, ...rest }) => (
          <Link
            key={to}
            to={to}
            activeOptions={
              "exact" in rest && rest.exact ? { exact: true } : undefined
            }
            activeProps={{
              className:
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-violet-600/20 text-violet-300",
            }}
            inactiveProps={{
              className:
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-zinc-400 hover:text-white hover:bg-zinc-800",
            }}
            className='flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors'
          >
            <Icon className='h-4 w-4' />
            {label}
          </Link>
        ))}
      </nav>

      <div className='p-3 border-t border-zinc-800'>
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className='w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors'
        >
          <LogOut className='h-4 w-4' />
          Log out
        </button>
      </div>
    </aside>
  );
}
