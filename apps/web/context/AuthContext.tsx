'use client';

import type { AuthenticatedUser } from '@apulse/shared';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type SessionResolver = () => Promise<AuthenticatedUser | null>;

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

interface AuthState {
  status: AuthStatus;
  user: AuthenticatedUser | null;
  error: Error | null;
}

interface AuthContextValue extends AuthState {
  signIn: (user: AuthenticatedUser) => void;
  signOut: () => void;
  retrySessionCheck: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
  resolveSession?: SessionResolver;
}

// ---------------------------------------------------------------------------
// Placeholder: replace with real session resolution once backend auth is wired.
// Should call GET /api/auth/me (or validate a stored access token) and return
// the authenticated user, or null when no valid session exists.
// ---------------------------------------------------------------------------
const resolveNoSession: SessionResolver = async () => null;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children, resolveSession = resolveNoSession }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    status: 'loading',
    user: null,
    error: null,
  });

  // requestId prevents stale responses from a previous check overwriting a newer one.
  const requestId = useRef(0);

  const checkSession = useCallback(
    (request: number) => {
      void Promise.resolve()
        .then(resolveSession)
        .then(
          (user) => {
            if (request === requestId.current) {
              setState({
                status: user ? 'authenticated' : 'unauthenticated',
                user,
                error: null,
              });
            }
          },
          (error: unknown) => {
            if (request === requestId.current) {
              setState({
                status: 'error',
                user: null,
                error: error instanceof Error ? error : new Error('Session check failed'),
              });
            }
          },
        );
    },
    [resolveSession],
  );

  const retrySessionCheck = useCallback(() => {
    const request = ++requestId.current;
    setState({ status: 'loading', user: null, error: null });
    checkSession(request);
  }, [checkSession]);

  useEffect(() => {
    const request = ++requestId.current;
    checkSession(request);
    // Cancel any in-flight request on unmount.
    return () => {
      requestId.current += 1;
    };
  }, [checkSession]);

  const signIn = useCallback((user: AuthenticatedUser) => {
    requestId.current += 1;
    setState({ status: 'authenticated', user, error: null });
  }, []);

  const signOut = useCallback(() => {
    requestId.current += 1;
    setState({ status: 'unauthenticated', user: null, error: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut, retrySessionCheck }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
