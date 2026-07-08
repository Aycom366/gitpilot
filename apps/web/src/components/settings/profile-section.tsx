import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button, FormInput } from "@gitpilot/ui";
import { usePutResource } from "../../hooks/use-api";
import { queryKeys } from "../../lib/query-client";
import { parseError } from "../../lib/utils";
import type { UserProfile } from "@gitpilot/shared-types";
import { profileSchema, type ProfileSchema } from "./constants";
import { SectionCard } from "./section-card";

interface ProfileSectionProps {
  user: UserProfile;
}

export function ProfileSection({ user }: ProfileSectionProps) {
  const profileForm = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    mode: "onBlur",
    values: { name: user.name ?? "" },
  });

  const profileMutation = usePutResource<UserProfile, ProfileSchema>({
    endpoint: "/users/me",
    queryKeyToInvalidate: queryKeys.users.me,
  });

  function onSaveProfile(values: ProfileSchema) {
    profileMutation.mutate(values, {
      onSuccess: () => toast.success("Profile updated"),
      onError: (e) => toast.error(parseError(e)),
    });
  }

  return (
    <SectionCard title='Profile' description='Update your display name'>
      <FormProvider {...profileForm}>
        <form
          id='profile-form'
          onSubmit={profileForm.handleSubmit(onSaveProfile)}
          className='space-y-4'
        >
          <FormInput<ProfileSchema>
            name='name'
            label='Full name'
            placeholder='Your name'
          />
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3'>
            <Button
              form='profile-form'
              type='submit'
              size='sm'
              disabled={profileMutation.isPending}
              className='w-fit'
            >
              {profileMutation.isPending ? "Saving…" : "Save changes"}
            </Button>
            <span className='text-xs text-zinc-500 break-all'>{user.email}</span>
          </div>
        </form>
      </FormProvider>
    </SectionCard>
  );
}
