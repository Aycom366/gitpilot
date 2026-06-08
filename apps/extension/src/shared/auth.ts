import browser from "webextension-polyfill";

// In-memory cache — populated by initAuth() on popup mount.
// Sync getters let createApiClient work without modification.
let _accessToken = "";
let _refreshToken = "";

/** Call this once on popup mount before rendering authenticated UI. */
export async function initAuth(): Promise<void> {
  const result = await browser.storage.local.get([
    "accessToken",
    "refreshToken",
  ]);
  _accessToken = (result.accessToken as string) ?? "";
  _refreshToken = (result.refreshToken as string) ?? "";
}

export function getToken(): string {
  return _accessToken;
}

export function getRefreshToken(): string {
  return _refreshToken;
}

export function setTokens(accessToken: string, refreshToken: string): void {
  _accessToken = accessToken;
  _refreshToken = refreshToken;
  void browser.storage.local.set({ accessToken, refreshToken });
}

export function removeTokens(): void {
  _accessToken = "";
  _refreshToken = "";
  void browser.storage.local.remove(["accessToken", "refreshToken"]);
}

export function isLoggedIn(): boolean {
  return !!_accessToken;
}
