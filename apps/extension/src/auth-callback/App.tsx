import { useEffect, useState } from 'react';
import { GitCommitHorizontal, CheckCircle, XCircle } from 'lucide-react';
import { apiClient } from 'src/shared/api';
import { setTokens } from 'src/shared/auth';

type Status = 'loading' | 'success' | 'error';

export function AuthCallbackApp() {
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('Linking extension…');

  useEffect(() => {
    const ott = new URLSearchParams(window.location.search).get('ott');
    if (!ott) {
      setStatus('error');
      setMessage('No token found in URL.');
      return;
    }

    apiClient
      .post<{ accessToken: string; refreshToken: string }>('/auth/exchange', { ott })
      .then((data) => {
        setTokens(data.accessToken, data.refreshToken);
        setStatus('success');
        setMessage('Extension linked! You can close this tab.');
      })
      .catch(() => {
        setStatus('error');
        setMessage('Link expired or already used. Try connecting again from the dashboard.');
      });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center p-8">
      <div className="flex items-center gap-2 mb-2">
        <GitCommitHorizontal className="h-5 w-5 text-violet-400" />
        <span className="text-lg font-bold text-white">GitPilot</span>
      </div>

      {status === 'loading' && (
        <>
          <div className="h-8 w-8 rounded-full border-2 border-zinc-700 border-t-violet-400 animate-spin" />
          <p className="text-sm text-zinc-400">{message}</p>
        </>
      )}
      {status === 'success' && (
        <>
          <CheckCircle className="h-10 w-10 text-emerald-400" />
          <p className="text-sm text-zinc-300">{message}</p>
        </>
      )}
      {status === 'error' && (
        <>
          <XCircle className="h-10 w-10 text-red-400" />
          <p className="text-sm text-zinc-400">{message}</p>
        </>
      )}
    </div>
  );
}
