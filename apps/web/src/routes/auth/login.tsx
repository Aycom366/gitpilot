import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button, FormInput } from "@gitpilot/ui";
import { useCreateResource } from "../../hooks/use-api";
import { setTokens } from "../../lib/auth";
import { parseError } from "../../lib/utils";
import type { AuthTokens } from "@gitpilot/shared-types";
import { GitHubButton } from "../../components/auth/github-button";
import { AuthDivider } from "../../components/auth/auth-divider";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type ILoginSchema = z.infer<typeof loginSchema>;

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const form = useForm<ILoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const loginMutation = useCreateResource<AuthTokens, ILoginSchema>({
    endpoint: "/auth/login",
  });

  function onSubmit(values: ILoginSchema) {
    loginMutation.mutate(values, {
      onSuccess: (data) => {
        setTokens(data.accessToken, data.refreshToken);
        toast.success("Welcome back!");
        void navigate({ to: "/dashboard" });
      },
      onError: (error) => {
        toast.error(parseError(error));
      },
    });
  }

  return (
    <>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold text-white'>Welcome back</h1>
        <p className='mt-1 text-sm text-zinc-400'>
          Log in to your GitPilot account
        </p>
      </div>

      <GitHubButton />

      <AuthDivider />

      <FormProvider {...form}>
        <form
          id='login-form'
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-5'
        >
          <FormInput<ILoginSchema>
            name='email'
            label='Email address'
            type='email'
            placeholder='you@example.com'
          />
          <FormInput<ILoginSchema>
            name='password'
            label='Password'
            type={showPassword ? "text" : "password"}
            placeholder='••••••••'
            inputRightElement={
              <button
                type='button'
                onClick={() => setShowPassword((p) => !p)}
                className='text-zinc-500 hover:text-zinc-300 transition-colors'
              >
                {showPassword ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </button>
            }
          />
        </form>
      </FormProvider>

      <div className='mt-6 space-y-3'>
        <Button
          form='login-form'
          type='submit'
          size='lg'
          className='w-full'
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? "Logging in..." : "Log in"}
        </Button>

        <p className='text-center text-sm text-zinc-500'>
          Don't have an account?{" "}
          <Link
            to='/auth/register'
            className='text-violet-400 hover:text-violet-300 font-medium'
          >
            Sign up free
          </Link>
        </p>
      </div>
    </>
  );
}
