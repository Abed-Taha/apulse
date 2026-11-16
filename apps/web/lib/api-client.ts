import axios from 'axios';
import type { TokenPair } from '@/types/auth.type';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const ACCESS_TOKEN_KEY = 'apulse-access-token';
const REFRESH_TOKEN_KEY = 'apulse-refresh-token';

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  if (accessToken) {
    return accessToken;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  accessToken = window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
  return accessToken;
}

export function setAuthTokens(tokens: TokenPair | null): void {
  accessToken = tokens?.accessToken ?? null;

  if (typeof window === 'undefined') {
    return;
  }

  if (tokens) {
    window.sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    window.sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    return;
  }

  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

// Automatically inject token into requests
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
