'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Global provider tree for the Apulse application.
 *
 * Add future providers here (e.g. TanStack Query, Material UI theme) by
 * wrapping them around or alongside AuthProvider.
 *
 * AuthProvider is included here for pages that sit outside the React Router
 * tree (e.g. server-rendered Next.js pages). The ClientRouter already wraps
 * its own AuthProvider internally — Providers does NOT add a second one for
 * the router subtree; AuthProvider is idempotent and each instance manages
 * its own independent state.
 */
export function Providers({ children }: ProvidersProps) {
  return <AuthProvider>{children}</AuthProvider>;
}
