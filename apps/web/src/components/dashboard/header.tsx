import { Badge } from "@gitpilot/ui";

interface DashboardHeaderProps {
  name?: string;
  isByok: boolean;
}

export function DashboardHeader({ name, isByok }: DashboardHeaderProps) {
  return (
    <div className='mb-8 flex items-center justify-between'>
      <div>
        <h1 className='text-2xl font-bold text-white'>
          {name ? `Hey, ${name.split(" ")[0]} 👋` : "Dashboard"}
        </h1>
        <p className='mt-1 text-sm text-zinc-400'>
          Today's usage across all generation types
        </p>
      </div>
      <Badge variant={isByok ? "default" : "outline"}>
        {isByok ? "BYOK" : "Free tier"}
      </Badge>
    </div>
  );
}
