import { useEffect, useState } from 'react';
import type { ThemePreference } from '@/types/settings';

export function resolveTheme(preference: ThemePreference): 'light' | 'dark' {
  if (preference === 'light' || preference === 'dark') return preference;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(preference: ThemePreference): void {
  const mode = resolveTheme(preference);
  document.documentElement.classList.toggle('dark', mode === 'dark');
}

export function useTheme(preference: ThemePreference): 'light' | 'dark' {
  const [mode, setMode] = useState<'light' | 'dark'>(() => resolveTheme(preference));

  useEffect(() => {
    const next = resolveTheme(preference);
    setMode(next);
    applyTheme(preference);
    if (preference !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      setMode(resolveTheme('system'));
      applyTheme('system');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [preference]);

  return mode;
}
