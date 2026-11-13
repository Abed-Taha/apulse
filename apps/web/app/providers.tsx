'use client';

import type { ReactNode } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '@/context/AuthContext';
import { queryClient } from '@/lib/query-client';
import { AppThemeProvider } from './theme-provider';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Global provider tree for the Apulse application.
 *
 * Shared providers are mounted here so both Next.js pages and the client-side
 * router have access to the same query cache, theme, and auth context.
 *
 * AuthProvider is included here for pages that sit outside the React Router
 * tree (e.g. server-rendered Next.js pages). The ClientRouter already wraps
 * its own AuthProvider internally — Providers does NOT add a second one for
 * the router subtree; AuthProvider is idempotent and each instance manages
 * its own independent state.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <CssBaseline />
        <AuthProvider>{children}</AuthProvider>
      </AppThemeProvider>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
