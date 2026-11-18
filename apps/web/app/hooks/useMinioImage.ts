'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface FileUrlResponse {
  url: string;
}

export function useMinioImage(key: string | null | undefined) {
  return useQuery({
    queryKey: ['minio-image', key],
    queryFn: async () => {
      const { data } = await apiClient.get<FileUrlResponse>('/storage/url', {
        params: { key },
      });

      return data.url;
    },
    enabled: Boolean(key?.trim()),
    staleTime: 50 * 60 * 1000,
  });
}

export function useImageUrl(key: string | null | undefined) {
  const { data, isLoading, error } = useMinioImage(key);

  return {
    url: data ?? null,
    isLoading,
    error,
  };
}
