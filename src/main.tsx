import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { migrateLegacyAccessToken } from './lib/authTokens';

const rootEl = document.getElementById('root')!;

void migrateLegacyAccessToken().finally(() => {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
