import { useQuery } from "@tanstack/react-query";
import { userQueryOptions, usageQueryOptions } from "../../lib/queries";
import { DashboardHeader } from "./header";
import { UsageGrid } from "./usage-grid";
import { ByokCallout } from "./byok-callout";
import { ExtensionHint } from "./extension-hint";

export function Dashboard() {
  const { data: user } = useQuery(userQueryOptions);
  const { data: usage, isLoading: usageLoading } = useQuery(usageQueryOptions);

  const isByok = usage?.tier === "byok" || user?.tier === "byok";
  const limit = usage?.limit ?? 10;

  return (
    <div className='mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10'>
      <DashboardHeader name={user?.name} isByok={!!isByok} />
      <UsageGrid
        isLoading={usageLoading}
        usage={usage?.today}
        limit={limit}
        isByok={!!isByok}
      />
      {!isByok && <ByokCallout />}
      <ExtensionHint />
    </div>
  );
}
