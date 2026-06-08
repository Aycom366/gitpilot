import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, GitCommitHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button, FormInput } from "@gitpilot/ui";
import { useCreateResource } from "src/shared/hooks";
import { setTokens } from "src/shared/auth";
import type { AuthTokens } from "@gitpilot/shared-types";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Required"),
});
type ISchema = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);

  const form = useForm<ISchema>({
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  const mutation = useCreateResource<AuthTokens, ISchema>({
    endpoint: "/auth/login",
  });

  function onSubmit(values: ISchema) {
    mutation.mutate(values, {
      onSuccess: (data) => {
        setTokens(data.accessToken, data.refreshToken);
        void navigate({ to: "/" });
      },
      onError: () => toast.error("Invalid email or password"),
    });
  }

  return (
    <div className='flex flex-col bg-zinc-950 min-h-[480px]'>
      <div className='flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900'>
        <GitCommitHorizontal className='h-4 w-4 text-violet-400' />
        <span className='text-sm font-bold text-white'>GitPilot</span>
      </div>

      <div className='flex-1 flex flex-col justify-center px-5 py-6'>
        <h1 className='text-base font-semibold text-white mb-1'>Sign in</h1>
        <p className='text-xs text-zinc-500 mb-5'>
          Or{" "}
          <a
            href={`${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/auth/github`}
            target='_blank'
            rel='noopener noreferrer'
            className='text-violet-400 hover:text-violet-300'
          >
            connect via GitHub
          </a>{" "}
          on the web dashboard
        </p>

        <FormProvider {...form}>
          <form
            id='ext-login'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormInput<ISchema>
              name='email'
              label='Email'
              type='email'
              placeholder='you@example.com'
            />
            <FormInput<ISchema>
              name='password'
              label='Password'
              type={showPw ? "text" : "password"}
              placeholder='••••••••'
              inputRightElement={
                <button
                  type='button'
                  onClick={() => setShowPw((p) => !p)}
                  className='text-zinc-500 hover:text-zinc-300'
                >
                  {showPw ? (
                    <EyeOff className='h-3.5 w-3.5' />
                  ) : (
                    <Eye className='h-3.5 w-3.5' />
                  )}
                </button>
              }
            />
          </form>
        </FormProvider>

        <Button
          form='ext-login'
          type='submit'
          size='sm'
          className='w-full mt-5'
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Signing in…" : "Sign in"}
        </Button>
      </div>
    </div>
  );
}
