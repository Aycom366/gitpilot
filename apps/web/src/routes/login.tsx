import { createFileRoute, redirect } from '@tanstack/react-router';

// Redirect /login → /auth/login
export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    throw redirect({ to: '/auth/login' });
  },
  component: () => null,
});
