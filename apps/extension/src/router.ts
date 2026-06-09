import {
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  redirect,
  Outlet,
} from "@tanstack/react-router";
import { initAuth, isLoggedIn } from "src/shared/auth";
import { LoginPage } from "src/popup/pages/login";
import { HomePage } from "src/popup/pages/home";
import { SettingsPage } from "src/popup/pages/settings";

// Root route: async-loads tokens from chrome.storage before any child renders
const rootRoute = createRootRoute({
  beforeLoad: () => initAuth(),
  component: Outlet,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  beforeLoad: () => {
    if (isLoggedIn()) throw redirect({ to: "/" });
  },
  component: LoginPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    if (!isLoggedIn()) throw redirect({ to: "/login" });
  },
  component: HomePage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  beforeLoad: () => {
    if (!isLoggedIn()) throw redirect({ to: "/login" });
  },
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  indexRoute,
  settingsRoute,
]);

export const router = createRouter({
  routeTree,
  history: createMemoryHistory({ initialEntries: ["/"] }),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
