import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * PRD 8.10 – Dialog Specification: title + description + Cancel/Confirm.
 * Reused for Reset Statistics, Unlock, Exit-while-spinning and delete confirms.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  danger,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="dialogOverlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="dialogCard"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="dialog-title">{title}</h3>
            {description && <p>{description}</p>}
            <div className="dialogActions">
              <button className="secondary" onClick={onCancel}>
                {cancelLabel ?? t('common.cancel')}
              </button>
              <button className={danger ? 'primary danger' : 'primary'} onClick={onConfirm}>
                {confirmLabel ?? t('common.confirm')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
