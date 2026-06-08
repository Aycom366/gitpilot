import type { GenerationType } from "@gitpilot/shared-types";
import { GENERATION_TYPES } from "./constants";
import { UsageCard } from "./usage-card";

interface UsageGridProps {
  isLoading: boolean;
  usage: Partial<Record<GenerationType, number>> | undefined;
  limit: number;
  isByok: boolean;
}

export function UsageGrid({ isLoading, usage, limit, isByok }: UsageGridProps) {
  if (isLoading) {
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className='bg-zinc-900 border border-zinc-800 rounded-xl p-5 h-32 animate-pulse'
          />
        ))}
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
      {GENERATION_TYPES.map(({ type, label, icon, description }) => (
        <UsageCard
          key={type}
          type={type}
          label={label}
          icon={icon}
          description={description}
          used={usage?.[type] ?? 0}
          limit={limit}
          isByok={isByok}
        />
      ))}
    </div>
  );
}
