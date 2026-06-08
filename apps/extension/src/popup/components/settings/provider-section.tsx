import { toast } from "sonner";
import { Button } from "@gitpilot/ui";
import { usePutResource } from "src/shared/hooks";
import type { UserProfile, ProviderName } from "@gitpilot/shared-types";
import { PROVIDERS } from "./constants";

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
    queryKeyToInvalidate: ["users", "me"],
  });

  return (
    <section>
      <p className='text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2'>
        AI Provider
      </p>
      <div className='space-y-1.5'>
        {PROVIDERS.map(({ value, label }) => (
          <button
            key={value}
            type='button'
            onClick={() => onSelectProvider(value)}
            className={`w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
              effectiveProvider === value
                ? "border-violet-500 bg-violet-600/10 text-white"
                : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            <div
              className={`h-3 w-3 rounded-full border-2 flex items-center justify-center ${effectiveProvider === value ? "border-violet-500" : "border-zinc-600"}`}
            >
              {effectiveProvider === value && (
                <div className='h-1.5 w-1.5 rounded-full bg-violet-500' />
              )}
            </div>
            {label}
          </button>
        ))}
      </div>
      <Button
        size='sm'
        className='mt-2 w-full'
        disabled={
          providerMutation.isPending ||
          effectiveProvider === user.preferredProvider
        }
        onClick={() =>
          providerMutation.mutate(
            { provider: effectiveProvider },
            {
              onSuccess: () => toast.success("Provider saved"),
              onError: () => toast.error("Failed to save"),
            },
          )
        }
      >
        {providerMutation.isPending ? "Saving…" : "Save provider"}
      </Button>
    </section>
  );
}
