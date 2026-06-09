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

export const Route = createFileRoute("/auth/register")({
  component: RegisterPage,
});

const API_URL = import.meta.env.VITE_API_URL;

function GitHubButton() {
  return (
    <a href={`${API_URL}/auth/github`} className='w-full'>
      <Button variant='outline' size='lg' className='w-full gap-2'>
        <svg className='h-4 w-4' viewBox='0 0 24 24' fill='currentColor'>
          <path d='M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z' />
        </svg>
        Continue with GitHub
      </Button>
    </a>
  );
}

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

      <div className='my-5 flex items-center gap-3'>
        <div className='h-px flex-1 bg-zinc-800' />
        <span className='text-xs text-zinc-600'>or continue with email</span>
        <div className='h-px flex-1 bg-zinc-800' />
      </div>

      <FormProvider {...form}>
        <form
          id='register-form'
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-5'
        >
          <FormInput<IRegisterSchema>
            name='name'
            label='Full name'
            placeholder='Ayomide'
          />
          <FormInput<IRegisterSchema>
            name='email'
            label='Email address'
            type='email'
            placeholder='you@example.com'
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
          <a href='#' className='text-zinc-400 hover:text-zinc-300'>
            Terms
          </a>{" "}
          and{" "}
          <a href='#' className='text-zinc-400 hover:text-zinc-300'>
            Privacy Policy
          </a>
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
