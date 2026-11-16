'use client';

import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, type SessionResolver, useAuth } from '@/context/AuthContext';
import { LoadingState, AppLayout } from '@/app/components';
import RegisterPage from '@/app/pages/auth/register/register.page';

export interface AppRouterProps {
  resolveSession?: SessionResolver;
}

export function AppRouter({ resolveSession }: AppRouterProps) {
  return (
    <AuthProvider resolveSession={resolveSession}>
      <BrowserRouter>
        <Routes>
          {/* Guest-only routes */}
          <Route element={<GuestGuard />}>
            <Route element={<AppLayout sideBarOpen={false} />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
            </Route>
          </Route>

          {/* Protected routes */}
          <Route element={<AuthGuard />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<main>Apulse</main>} />

              {/*
            Add protected routes here:
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
          */}

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// ---------------------------------------------------------------------------
// AuthGuard – protects routes that require an authenticated user.
// Shows a loading screen while session initialisation is running.
// Redirects unauthenticated users to /login, preserving the full location
// (pathname + search + hash) so they can be sent back after sign-in.
// ---------------------------------------------------------------------------
function AuthGuard() {
  const { status, error, retrySessionCheck } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <LoadingState />;
  }

  if (status === 'error') {
    return (
      <main role="alert">
        <p>Unable to check your sign-in status: {error?.message}</p>
        <button type="button" onClick={retrySessionCheck}>
          Retry
        </button>
      </main>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

// ---------------------------------------------------------------------------
// GuestGuard – protects guest-only routes (e.g. /login).
// Redirects authenticated users back to the app (or the originally requested
// URL stored in location state).
// ---------------------------------------------------------------------------
function GuestGuard() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <LoadingState />;
  }

  if (status === 'authenticated') {
    return <Navigate to={getReturnTo(location.state)} replace />;
  }

  return <Outlet />;
}

// ---------------------------------------------------------------------------
// Page components (UI implementations added separately per task scope)
// ---------------------------------------------------------------------------
function LoginPage() {
  return (
    <main>
      <h1>Login</h1>
      <p>The login screen will be added separately.</p>
    </main>
  );
}

function NotFoundPage() {
  return (
    <main>
      <h1>Page not found</h1>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Return-URL helper – validates the stored location to prevent open redirects.
// Accepts only same-origin paths (must start with "/" but not "//").
// Rejects guest-only routes to avoid authentication loops.
// ---------------------------------------------------------------------------
function getReturnTo(state: unknown): string {
  if (typeof state !== 'object' || state === null || !('from' in state)) {
    return '/';
  }

  const from = state.from;
  if (
    typeof from !== 'object' ||
    from === null ||
    !('pathname' in from) ||
    !('search' in from) ||
    !('hash' in from) ||
    typeof from.pathname !== 'string' ||
    typeof from.search !== 'string' ||
    typeof from.hash !== 'string' ||
    !from.pathname.startsWith('/') ||
    from.pathname.startsWith('//') ||
    from.pathname === '/login' ||
    from.pathname === '/register'
  ) {
    return '/';
  }

  return `${from.pathname}${from.search}${from.hash}`;
}
