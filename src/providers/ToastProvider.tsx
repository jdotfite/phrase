'use client';

import React, { useState, useCallback } from 'react';
import { ToastActionElement, ToastProps } from '@/components/ui/toast';
import { Toaster } from '@/components/ui/toaster';

export type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const TOAST_LIMIT = 5;

type ToastContextType = {
  toasts: ToasterToast[];
  toast: (props: Omit<ToasterToast, "id">) => void;
  dismiss: (toastId: string) => void;
};

// Create a context with a no-op default
export const ToastContext = React.createContext<ToastContextType>({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToasterToast[]>([]);

  const toast = useCallback((props: Omit<ToasterToast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [{ ...props, id }, ...prev].slice(0, TOAST_LIMIT));
    return id;
  }, []);

  const dismiss = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
}