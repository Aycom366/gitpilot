import { toast } from "sonner";
import { Button } from "@gitpilot/ui";
import { usePutResource } from "../../hooks/use-api";
import { queryKeys } from "../../lib/query-client";
import { parseError } from "../../lib/utils";
import type { UserProfile, ProviderName } from "@gitpilot/shared-types";
import { PROVIDERS } from "./constants";
import { SectionCard } from "./section-card";

interface ProviderSectionProps {
  user: UserProfile;
  effectiveProvider: ProviderName;
  onSelectProvider: (provider: ProviderName) => void;
}

export function ProviderSection({
  user,
  effectiveProvider,
  onSelectProvider,
}: ProviderSectionProps) {
  const providerMutation = usePutResource<
    UserProfile,
    { provider: ProviderName }
  >({
    endpoint: "/users/me/provider",
    queryKeyToInvalidate: queryKeys.users.me,
  });

  function onSaveProvider() {
    providerMutation.mutate(
      { provider: effectiveProvider },
      {
        onSuccess: () => toast.success("Provider updated"),
        onError: (e) => toast.error(parseError(e)),
      },
    );
  }

  return (
    <SectionCard
      title='AI Provider'
      description='Choose which model generates your content'
    >
      <div className='space-y-2 mb-4'>
        {PROVIDERS.map(({ value, label, description }) => (
          <button
            key={value}
            type='button'
            onClick={() => onSelectProvider(value)}
            className={`w-full text-left flex items-start gap-3 rounded-lg border p-3 transition-colors ${
              effectiveProvider === value
                ? "border-violet-500 bg-violet-600/10"
                : "border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div
              className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                effectiveProvider === value
                  ? "border-violet-500"
                  : "border-zinc-600"
              }`}
            >
              {effectiveProvider === value && (
                <div className='h-2 w-2 rounded-full bg-violet-500' />
              )}
            </div>
            <div>
              <p className='text-sm font-medium text-white'>{label}</p>
              <p className='text-xs text-zinc-500'>{description}</p>
            </div>
          </button>
        ))}
      </div>
      <Button
        size='sm'
        disabled={
          providerMutation.isPending ||
          effectiveProvider === user.preferredProvider
        }
        onClick={onSaveProvider}
      >
        {providerMutation.isPending ? "Saving…" : "Save preference"}
      </Button>
    </SectionCard>
  );
}
