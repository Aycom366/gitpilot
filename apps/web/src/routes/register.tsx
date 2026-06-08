import { createFileRoute, redirect } from "@tanstack/react-router";

// Redirect /register → /auth/register
export const Route = createFileRoute("/register")({
  beforeLoad: () => {
    throw redirect({ to: "/auth/register" });
  },
  component: () => null,
});
