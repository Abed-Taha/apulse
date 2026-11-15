'use client';

import dynamic from 'next/dynamic';
import type { AppRouterProps } from './AppRouter';
import { LoadingState } from '@/app/components';

// AppRouter uses BrowserRouter which requires the DOM — disable SSR.
const AppRouter = dynamic(() => import('./AppRouter').then((module) => module.AppRouter), {
  ssr: false,
  loading: () => <LoadingState />,
});

export function ClientRouter(props: AppRouterProps) {
  return <AppRouter {...props} />;
}
