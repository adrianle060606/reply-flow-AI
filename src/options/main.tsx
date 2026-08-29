import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { OptionsApp } from '@/options/App';
import '@/styles/globals.css';

async function boot() {
  if (import.meta.env.VITE_PREVIEW) {
    const { installPreviewRuntime } = await import('@/preview/install-chrome');
    installPreviewRuntime();
  }
  const root = document.getElementById('root');
  if (!root) throw new Error('Options root missing');
  createRoot(root).render(
    <StrictMode>
      <OptionsApp />
    </StrictMode>,
  );
}

void boot();
