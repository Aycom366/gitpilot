import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { isLoggedIn } from "../../lib/auth";
import { Sidebar } from "../../components/dashboard/sidebar";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    if (!isLoggedIn()) throw redirect({ to: "/auth/login" });
  },
  component: DashboardRouteLayout,
});

function DashboardRouteLayout() {
  return (
    <div className='h-svh bg-zinc-950 flex overflow-hidden'>
      <Sidebar />
      <main className='flex-1 overflow-auto'>
        <Outlet />
      </main>
    </div>
  );
}
