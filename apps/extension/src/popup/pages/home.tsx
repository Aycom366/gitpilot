import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  GitCommitHorizontal,
  GitPullRequest,
  GitBranch,
  LogOut,
} from "lucide-react";
import { Badge } from "@gitpilot/ui";
import { PopupHeader } from "src/popup/components/header";
import { userQueryOptions, usageQueryOptions } from "src/lib/queries";
import { removeTokens } from "src/shared/auth";
import type { GenerationType } from "@gitpilot/shared-types";

const TYPES: {
  type: GenerationType;
  label: string;
  icon: React.ElementType;
}[] = [
  { type: "commit", label: "Commit", icon: GitCommitHorizontal },
  { type: "pr", label: "PR", icon: GitPullRequest },
  { type: "branch", label: "Branch", icon: GitBranch },
];

export function HomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useQuery(userQueryOptions);
  const { data: usage, isLoading } = useQuery(usageQueryOptions);

  const isByok = user?.tier === "byok";
  const limit = usage?.limit ?? 10;

  function handleLogout() {
    removeTokens();
    queryClient.clear();
    void navigate({ to: "/login" });
  }

  return (
    <div className='flex flex-col bg-zinc-950 min-h-[480px]'>
      <PopupHeader />

      <div className='flex-1 px-4 py-4 space-y-4'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm font-medium text-white'>
              {user?.name ?? "…"}
            </p>
            <p className='text-xs text-zinc-500'>{user?.email ?? ""}</p>
          </div>
          <Badge variant={isByok ? "default" : "outline"} className='text-xs'>
            {isByok ? "BYOK" : "Free"}
          </Badge>
        </div>

        <div>
          <p className='text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2'>
            Today's usage
          </p>
          {isLoading ? (
            <div className='space-y-2'>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className='h-10 rounded-lg bg-zinc-800 animate-pulse'
                />
              ))}
            </div>
          ) : (
            <div className='space-y-2'>
              {TYPES.map(({ type, label, icon: Icon }) => {
                const used = usage?.today?.[type] ?? 0;
                const pct = isByok ? 0 : Math.min((used / limit) * 100, 100);
                return (
                  <div
                    key={type}
                    className='flex items-center gap-3 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2'
                  >
                    <Icon className='h-3.5 w-3.5 text-violet-400 shrink-0' />
                    <span className='flex-1 text-xs text-zinc-300'>
                      {label}
                    </span>
                    {isByok ? (
                      <span className='text-xs text-emerald-400 font-medium'>
                        ∞
                      </span>
                    ) : (
                      <div className='flex items-center gap-2'>
                        <div className='w-16 h-1 rounded-full bg-zinc-800 overflow-hidden'>
                          <div
                            className='h-full rounded-full bg-violet-500'
                            style={{
                              width: `${pct}%`,
                              backgroundColor:
                                pct >= 100 ? "#ef4444" : undefined,
                            }}
                          />
                        </div>
                        <span
                          className={`text-xs tabular-nums ${used >= limit ? "text-red-400" : "text-zinc-500"}`}
                        >
                          {used}/{limit}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!isByok && (
          <p className='text-xs text-zinc-600 text-center'>
            Add your API key in{" "}
            <button
              onClick={() => void navigate({ to: "/settings" })}
              className='text-violet-400 hover:text-violet-300'
            >
              Settings
            </button>{" "}
            for unlimited use
          </p>
        )}
      </div>

      <div className='px-4 pb-4'>
        <button
          onClick={handleLogout}
          className='flex items-center gap-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors'
        >
          <LogOut className='h-3.5 w-3.5' />
          Log out
        </button>
      </div>
    </div>
  );
}
