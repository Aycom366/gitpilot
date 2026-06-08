import browser from 'webextension-polyfill';

export async function getAccessToken(): Promise<string | null> {
  const result = await browser.storage.local.get('accessToken');
  return (result.accessToken as string) ?? null;
}

export async function setTokens(accessToken: string, refreshToken: string) {
  await browser.storage.local.set({ accessToken, refreshToken });
}

export async function clearTokens() {
  await browser.storage.local.remove(['accessToken', 'refreshToken']);
}

export async function isLoggedIn(): Promise<boolean> {
  const token = await getAccessToken();
  return !!token;
}
