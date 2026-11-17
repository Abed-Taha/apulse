import { apiClient } from '@/lib/api-client';
import type { AuthenticatedUser } from '@apulse/shared';
import type { LoginPayload, RegisterPayload, TokenPair } from '@/types/auth.type';

export const authService = {
  async register(payload: RegisterPayload): Promise<TokenPair> {
    const { data } = await apiClient.post<TokenPair>('/auth/register', payload);

    return data;
  },
  async getCurrentUser(): Promise<AuthenticatedUser> {
    const { data } = await apiClient.get<AuthenticatedUser>('/auth/me');

    return data;
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/auth/logout', { refreshToken });
  },

  async login(payload: LoginPayload): Promise<TokenPair> {
    const { data } = await apiClient.post<TokenPair>('/auth/login', payload);
    return data;
  },
};
