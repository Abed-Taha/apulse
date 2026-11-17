'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getAccessToken } from '@/lib/api-client';
import { authService } from '@/services/auth.service';

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = getAccessToken();

      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    },

    onSettled: () => {
      signOut();
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });
}
