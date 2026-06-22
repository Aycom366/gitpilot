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

export const Route = createFileRoute("/auth/register")({
  component: RegisterPage,
});

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type IRegisterSchema = z.infer<typeof registerSchema>;

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const form = useForm<IRegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const registerMutation = useCreateResource<AuthTokens, IRegisterSchema>({
    endpoint: "/auth/register",
  });

  function onSubmit(values: IRegisterSchema) {
    registerMutation.mutate(values, {
      onSuccess: (data) => {
        setTokens(data.accessToken, data.refreshToken);
        toast.success("Account created! Welcome to GitPilot.");
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
        <h1 className='text-2xl font-bold text-white'>Create your account</h1>
        <p className='mt-1 text-sm text-zinc-400'>
          Free forever · No credit card required
        </p>
      </div>

      <GitHubButton />

      <AuthDivider />

      <FormProvider {...form}>
        <form
          id='register-form'
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-5'
        >
          <FormInput<IRegisterSchema>
            name='name'
            label='Full name'
            placeholder='John Doe'
          />
          <FormInput<IRegisterSchema>
            name='email'
            label='Email address'
            type='email'
            placeholder='john.doe@example.com'
          />
          <FormInput<IRegisterSchema>
            name='password'
            label='Password'
            type={showPassword ? "text" : "password"}
            placeholder='Min. 8 characters'
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
          form='register-form'
          type='submit'
          size='lg'
          className='w-full'
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending
            ? "Creating account..."
            : "Create account"}
        </Button>

        <p className='text-center text-xs text-zinc-600'>
          By signing up you agree to our{" "}
          <Link to='/terms' className='text-zinc-400 hover:text-zinc-300'>
            Terms
          </Link>{" "}
          and{" "}
          <Link to='/privacy' className='text-zinc-400 hover:text-zinc-300'>
            Privacy Policy
          </Link>
        </p>

        <p className='text-center text-sm text-zinc-500'>
          Already have an account?{" "}
          <Link
            to='/auth/login'
            className='text-violet-400 hover:text-violet-300 font-medium'
          >
            Log in
          </Link>
        </p>
      </div>
    </>
  );
}
