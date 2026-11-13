'use client';

import { useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { createAppTheme } from './theme';

const colorSchemeQuery = '(prefers-color-scheme: dark)';

function subscribeToColorMode(onStoreChange: () => void) {
  const root = document.documentElement;
  const observer = new MutationObserver(onStoreChange);
  const mediaQuery = window.matchMedia(colorSchemeQuery);

  observer.observe(root, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  mediaQuery.addEventListener('change', onStoreChange);

  return () => {
    observer.disconnect();
    mediaQuery.removeEventListener('change', onStoreChange);
  };
}

function getColorModeSnapshot(): 'light' | 'dark' {
  const explicitMode = document.documentElement.dataset.theme;
  if (explicitMode === 'light' || explicitMode === 'dark') {
    return explicitMode;
  }

  return window.matchMedia(colorSchemeQuery).matches ? 'dark' : 'light';
}

function getServerColorModeSnapshot(): 'light' | 'dark' {
  return 'light';
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const mode = useSyncExternalStore(
    subscribeToColorMode,
    getColorModeSnapshot,
    getServerColorModeSnapshot,
  );
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
