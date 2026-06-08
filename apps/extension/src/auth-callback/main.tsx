import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthCallbackApp } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthCallbackApp />
  </StrictMode>,
);
