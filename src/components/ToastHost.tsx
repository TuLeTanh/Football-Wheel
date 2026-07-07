import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore } from '@/stores/useToastStore';

/** PRD 8.11 – Toast Messages: short-lived confirmations stacked bottom-center. */
export default function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="toastHost" aria-live="polite">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={`toast toast-${toast.tone}`}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {toast.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
