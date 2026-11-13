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
import { createAppTheme, THEME_STORAGE_KEY } from './theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const THEME_EVENT = 'apulse-theme-change';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function subscribeToTheme(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(THEME_EVENT, callback);

  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(THEME_EVENT, callback);
  };
}

function getThemeSnapshot(): ThemeMode {
  return localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark';
}

function getServerThemeSnapshot(): ThemeMode {
  return 'dark';
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const mode = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);

  const setTheme = useCallback((newMode: ThemeMode) => {
    localStorage.setItem(THEME_STORAGE_KEY, newMode);
    document.documentElement.dataset.theme = newMode;
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(mode === 'dark' ? 'light' : 'dark');
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
