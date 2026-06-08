import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button, FormInput } from "@gitpilot/ui";
import { usePutResource, useDeleteResource } from "src/shared/hooks";
import type { UserProfile, ProviderName } from "@gitpilot/shared-types";
import { apiKeySchema, type ApiKeySchema } from "./constants";

interface ByokSectionProps {
  user: UserProfile;
  effectiveProvider: ProviderName;
}

export function ByokSection({ user, effectiveProvider }: ByokSectionProps) {
  const queryClient = useQueryClient();

  const apiKeyForm = useForm<ApiKeySchema>({
    resolver: zodResolver(apiKeySchema),
    mode: "onBlur",
  });

  const apiKeyMutation = usePutResource<
    UserProfile,
    { provider: ProviderName; apiKey: string }
  >({
    endpoint: "/users/me/provider",
    queryKeyToInvalidate: ["users", "me"],
  });

  const deleteKeyMutation = useDeleteResource<UserProfile>({
    endpoint: "/users/me/api-key",
    queryKeyToInvalidate: ["users", "me"],
  });

  return (
    <section>
      <p className='text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2'>
        API Key{" "}
        {user.hasApiKey && (
          <span className='text-emerald-400 ml-1'>● saved</span>
        )}
      </p>
      <FormProvider {...apiKeyForm}>
        <form
          id='ext-key-form'
          onSubmit={apiKeyForm.handleSubmit((values) =>
            apiKeyMutation.mutate(
              { provider: effectiveProvider, apiKey: values.apiKey },
              {
                onSuccess: () => {
                  toast.success("API key saved");
                  apiKeyForm.reset();
                  void queryClient.invalidateQueries({
                    queryKey: ["users", "me"],
                  });
                },
                onError: () => toast.error("Failed to save key"),
              },
            ),
          )}
          className='space-y-2'
        >
          <FormInput<ApiKeySchema>
            name='apiKey'
            label=''
            type='password'
            placeholder='sk-…'
          />
          <div className='flex gap-2'>
            <Button
              form='ext-key-form'
              type='submit'
              size='sm'
              className='flex-1'
              disabled={apiKeyMutation.isPending}
            >
              {apiKeyMutation.isPending ? "Saving…" : "Save key"}
            </Button>
            {user.hasApiKey && (
              <Button
                type='button'
                variant='ghost'
                size='sm'
                disabled={deleteKeyMutation.isPending}
                onClick={() =>
                  deleteKeyMutation.mutate(undefined, {
                    onSuccess: () => toast.success("Key removed"),
                    onError: () => toast.error("Failed"),
                  })
                }
                className='text-red-400 hover:text-red-300'
              >
                <Trash2 className='h-3.5 w-3.5' />
              </Button>
            )}
          </div>
        </form>
      </FormProvider>
    </section>
  );
}
