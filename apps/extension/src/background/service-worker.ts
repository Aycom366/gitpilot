import browser from 'webextension-polyfill';

// Listen for OTT deep link callback
browser.runtime.onMessage.addListener((message) => {
  if (message.type === 'OTT_RECEIVED') {
    exchangeOtt(message.ott);
  }
});

async function exchangeOtt(ott: string) {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ott }),
    });
    const { accessToken, refreshToken } = await res.json();
    await browser.storage.local.set({ accessToken, refreshToken });
    console.log('[GitPilot] Extension linked successfully');
  } catch (err) {
    console.error('[GitPilot] OTT exchange failed', err);
  }
}
