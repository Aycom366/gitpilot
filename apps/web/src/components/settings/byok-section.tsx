import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button, FormInput, Badge } from "@gitpilot/ui";
import {
  usePutResource,
  useDeleteResource,
} from "../../hooks/use-api";
import { queryKeys } from "../../lib/query-client";
import { parseError } from "../../lib/utils";
import type { UserProfile, ProviderName } from "@gitpilot/shared-types";
import { PROVIDERS, apiKeySchema, type ApiKeySchema } from "./constants";
import { SectionCard } from "./section-card";

interface ByokSectionProps {
  user: UserProfile;
  effectiveProvider: ProviderName;
}

export function ByokSection({ user, effectiveProvider }: ByokSectionProps) {
  const apiKeyForm = useForm<ApiKeySchema>({
    resolver: zodResolver(apiKeySchema),
    mode: "onBlur",
  });

  const apiKeyMutation = usePutResource<
    UserProfile,
    { provider: ProviderName; apiKey: string }
  >({
    endpoint: "/users/me/provider",
    queryKeyToInvalidate: queryKeys.users.me,
  });

  const deleteApiKeyMutation = useDeleteResource<UserProfile>({
    endpoint: "/users/me/api-key",
    queryKeyToInvalidate: queryKeys.users.me,
  });

  function onSaveApiKey(values: ApiKeySchema) {
    apiKeyMutation.mutate(
      { provider: effectiveProvider, apiKey: values.apiKey },
      {
        onSuccess: () => {
          toast.success("API key saved — you're now on BYOK tier");
          apiKeyForm.reset();
        },
        onError: (e) => toast.error(parseError(e)),
      },
    );
  }

  function onDeleteApiKey() {
    deleteApiKeyMutation.mutate(undefined, {
      onSuccess: () => toast.success("API key removed"),
      onError: (e) => toast.error(parseError(e)),
    });
  }

  return (
    <SectionCard
      title='Bring Your Own API Key'
      description='Bypass the 20/day limit by using your own provider key'
    >
      <div className='flex items-center gap-2 mb-4'>
        <Badge variant={user.tier === "byok" ? "default" : "outline"}>
          {user.tier === "byok" ? "BYOK active" : "Free tier"}
        </Badge>
        {user.hasApiKey && (
          <span className='text-xs text-zinc-500'>A key is currently saved</span>
        )}
      </div>

      <FormProvider {...apiKeyForm}>
        <form
          id='apikey-form'
          onSubmit={apiKeyForm.handleSubmit(onSaveApiKey)}
          className='space-y-3'
        >
          <FormInput<ApiKeySchema>
            name='apiKey'
            label={`${PROVIDERS.find((p) => p.value === effectiveProvider)?.label ?? "Provider"} API key`}
            type='password'
            placeholder='sk-…'
          />
          <div className='flex items-center gap-2'>
            <Button
              form='apikey-form'
              type='submit'
              size='sm'
              disabled={apiKeyMutation.isPending}
            >
              {apiKeyMutation.isPending ? "Saving…" : "Save key"}
            </Button>
            {user.hasApiKey && (
              <Button
                type='button'
                variant='ghost'
                size='sm'
                disabled={deleteApiKeyMutation.isPending}
                onClick={onDeleteApiKey}
                className='text-red-400 hover:text-red-300 gap-1.5'
              >
                <Trash2 className='h-3.5 w-3.5' />
                {deleteApiKeyMutation.isPending ? "Removing…" : "Remove key"}
              </Button>
            )}
          </div>
        </form>
      </FormProvider>
    </SectionCard>
  );
}
