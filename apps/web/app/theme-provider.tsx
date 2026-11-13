'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { createAppTheme } from './theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const THEME_STORAGE_KEY = 'apulse-theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function subscribeToTheme(callback: () => void) {
  window.addEventListener('storage', callback);

  return () => {
    window.removeEventListener('storage', callback);
  };
}

function getThemeSnapshot(): ThemeMode {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  return savedTheme === 'dark' ? 'dark' : 'light';
}

function getServerThemeSnapshot(): ThemeMode {
  return 'light';
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const mode = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);

  const setTheme = useCallback((newMode: ThemeMode) => {
    localStorage.setItem(THEME_STORAGE_KEY, newMode);
    document.documentElement.dataset.theme = newMode;

    // Notify this tab's subscribers.
    window.dispatchEvent(new Event('apulse-theme-change'));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(mode === 'light' ? 'dark' : 'light');
  }, [mode, setTheme]);

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const contextValue = useMemo(
    () => ({ mode, toggleTheme, setTheme }),
    [mode, toggleTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }

  return context;
}
