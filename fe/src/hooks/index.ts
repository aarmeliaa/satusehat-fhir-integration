'use client';

import { useState, useCallback } from 'react';
import { LoadingState, ToastNotification } from '@/types';
import { extractBFFErrorMessage } from '@/lib/api';

export const useFetch = () => {
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async <T,>(
      fetchFn: () => Promise<T>,
      onSuccess?: (data: T) => void
    ): Promise<{ data?: T; error?: string }> => {
      setLoading({ isLoading: true, error: null });
      try {
        const result = await fetchFn();
        setLoading({ isLoading: false, error: null });
        onSuccess?.(result);
        return { data: result };
      } catch (err: any) {
        const errorMessage = extractBFFErrorMessage(err);
        setLoading({ isLoading: false, error: errorMessage });
        return { error: errorMessage };
      }
    },
    []
  );

  return { ...loading, execute };
};

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info', duration = 4000) => {
      const id = Date.now().toString();
      const newToast: ToastNotification = { id, message, type, duration };
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
};
