import { create } from 'zustand';
import type { ToastMessage } from '@/types';

interface ToastState {
  toasts: ToastMessage[];
  show: (text: string, tone?: ToastMessage['tone']) => void;
  dismiss: (id: string) => void;
}

// Not persisted: toasts are always transient session UI feedback.
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (text, tone = 'default') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set((s) => ({ toasts: [...s.toasts, { id, text, tone }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 2600);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
}));
