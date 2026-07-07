import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BackHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  action?: ReactNode;
}

/** Shared header used by every non-Home screen: back button + title + optional action slot. */
export default function BackHeader({ title, subtitle, onBack, action }: BackHeaderProps) {
  const { t } = useTranslation();
  return (
    <header className="screenHeader">
      <button className="iconButton" onClick={onBack} aria-label={t('common.back')}>
        <ArrowLeft size={20} />
      </button>
      <div className="screenHeaderText">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && <div className="screenHeaderAction">{action}</div>}
    </header>
  );
}
