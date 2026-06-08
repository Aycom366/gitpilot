import { useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { setTokens } from '../../lib/auth';

export const Route = createFileRoute('/auth/callback')({
  component: CallbackPage,
});

function CallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
      toast.success('Signed in with GitHub!');
      void navigate({ to: '/dashboard' });
    } else {
      toast.error('GitHub sign-in failed. Please try again.');
      void navigate({ to: '/auth/login' });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-zinc-400">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-violet-400" />
        <p className="text-sm">Signing you in...</p>
      </div>
    </div>
  );
}
