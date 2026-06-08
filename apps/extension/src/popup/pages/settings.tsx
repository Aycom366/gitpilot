import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ProviderName } from "@gitpilot/shared-types";
import { PopupHeader } from "src/popup/components/header";
import { userQueryOptions } from "src/lib/queries";
import { ProviderSection } from "../components/settings/provider-section";
import { ByokSection } from "../components/settings/byok-section";
import { LinksSection } from "../components/settings/links-section";

export function SettingsPage() {
  const { data: user } = useQuery(userQueryOptions);
  const [selectedProvider, setSelectedProvider] = useState<ProviderName | null>(
    null,
  );
  const effectiveProvider =
    selectedProvider ?? user?.preferredProvider ?? "google";

  if (!user) return null;

  return (
    <div className='flex flex-col bg-zinc-950 min-h-[480px]'>
      <PopupHeader />

      <div className='flex-1 overflow-auto px-4 py-4 space-y-5'>
        <ProviderSection
          user={user}
          effectiveProvider={effectiveProvider}
          onSelectProvider={setSelectedProvider}
        />
        <ByokSection user={user} effectiveProvider={effectiveProvider} />
        <LinksSection />
      </div>
    </div>
  );
}
