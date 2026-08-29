import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { installPreviewRuntime } from '@/preview/install-chrome';
import { PreviewApp } from '@/preview/PreviewApp';
import '@/styles/globals.css';

installPreviewRuntime();

const root = document.getElementById('root');
if (!root) throw new Error('Preview root missing');
createRoot(root).render(
  <StrictMode>
    <PreviewApp />
  </StrictMode>,
);
