import { Badge } from "@gitpilot/ui";

interface DashboardHeaderProps {
  name?: string;
  isByok: boolean;
}

export function DashboardHeader({ name, isByok }: DashboardHeaderProps) {
  return (
    <div className='mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between'>
      <div className='min-w-0'>
        <h1 className='text-xl font-bold text-white sm:text-2xl'>
          {name ? `Hey, ${name.split(" ")[0]} 👋` : "Dashboard"}
        </h1>
        <p className='mt-1 text-sm text-zinc-400'>
          Today's usage across all generation types
        </p>
      </div>
      <Badge
        variant={isByok ? "default" : "outline"}
        className='w-fit shrink-0'
      >
        {isByok ? "BYOK" : "Free tier"}
      </Badge>
    </div>
  );
}
