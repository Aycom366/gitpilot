import type { GenerationType } from "@gitpilot/shared-types";

interface UsageCardProps {
  type: GenerationType;
  label: string;
  icon: React.ElementType;
  description: string;
  used: number;
  limit: number;
  isByok: boolean;
}

export function UsageCard({
  label,
  icon: Icon,
  description,
  used,
  limit,
  isByok,
}: UsageCardProps) {
  const pct = isByok ? 0 : Math.min((used / limit) * 100, 100);

  return (
    <div className='bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 flex flex-col gap-4'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex min-w-0 items-center gap-3'>
          <div className='h-9 w-9 shrink-0 rounded-lg bg-violet-600/15 flex items-center justify-center'>
            <Icon className='h-4 w-4 text-violet-400' />
          </div>
          <div className='min-w-0'>
            <p className='text-sm font-semibold text-white'>{label}</p>
            <p className='text-xs text-zinc-500'>{description}</p>
          </div>
        </div>
        <span className='shrink-0 text-xs text-zinc-400'>
          {isByok ? (
            <span className='text-emerald-400 font-medium'>∞</span>
          ) : (
            <span className={used >= limit ? "text-red-400 font-medium" : ""}>
              {used}/{limit}
            </span>
          )}
        </span>
      </div>

      {!isByok && (
        <div className='space-y-1'>
          <div className='h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden'>
            <div
              className='h-full rounded-full bg-violet-500 transition-all duration-300'
              style={{
                width: `${pct}%`,
                backgroundColor: pct >= 100 ? "#ef4444" : undefined,
              }}
            />
          </div>
          <p className='text-xs text-zinc-600'>{limit - used} remaining today</p>
        </div>
      )}
    </div>
  );
}
