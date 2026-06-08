import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ProviderName } from "@gitpilot/shared-types";
import { userQueryOptions } from "../../lib/queries";
import { SettingsHeader } from "./header";
import { SettingsLoading } from "./loading";
import { ProfileSection } from "./profile-section";
import { ProviderSection } from "./provider-section";
import { ByokSection } from "./byok-section";
import { ExtensionSection } from "./extension-section";

export function Settings() {
  const { data: user, isLoading } = useQuery(userQueryOptions);
  const [selectedProvider, setSelectedProvider] =
    useState<ProviderName | null>(null);

  if (isLoading || !user) {
    return <SettingsLoading />;
  }

  const effectiveProvider =
    selectedProvider ?? user.preferredProvider ?? "google";

  return (
    <div className='max-w-2xl mx-auto px-6 py-10 space-y-6'>
      <SettingsHeader />
      <ProfileSection user={user} />
      <ProviderSection
        user={user}
        effectiveProvider={effectiveProvider}
        onSelectProvider={setSelectedProvider}
      />
      <ByokSection user={user} effectiveProvider={effectiveProvider} />
      <ExtensionSection />
    </div>
  );
}
