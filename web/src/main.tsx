import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/spotlight/styles.css';
import '@mantine/nprogress/styles.css';
import '@mantine/code-highlight/styles.css';
import '@mantine/dates/styles.css';
import './shared/theme/global.css';

import './shared/i18n/i18n';
import { App } from './App';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

// Fade out the pre-hydration boot screen.
requestAnimationFrame(() => {
  const boot = document.getElementById('gs-boot');
  if (boot) {
    boot.style.opacity = '0';
    setTimeout(() => boot.remove(), 500);
  }
});
