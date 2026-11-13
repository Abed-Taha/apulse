'use client';

import dynamic from 'next/dynamic';
import type { AppRouterProps } from './AppRouter';

// AppRouter uses BrowserRouter which requires the DOM — disable SSR.
const AppRouter = dynamic(() => import('./AppRouter').then((module) => module.AppRouter), {
  ssr: false,
  loading: () => (
    <main aria-busy="true" aria-live="polite">
      <p>Loading…</p>
    </main>
  ),
});

export function ClientRouter(props: AppRouterProps) {
  return <AppRouter {...props} />;
}
