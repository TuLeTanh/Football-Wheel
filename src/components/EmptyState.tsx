import type { ComponentType } from 'react';

interface EmptyStateProps {
  icon: ComponentType<{ size?: number }>;
  title: string;
  body?: string;
}

/** PRD 8.8 – Empty States: icon + title + short supporting copy, never a blank screen. */
export default function EmptyState({ icon: Icon, title, body }: EmptyStateProps) {
  return (
    <div className="emptyState">
      <Icon size={40} />
      <p className="emptyStateTitle">{title}</p>
      {body && <p className="emptyStateBody">{body}</p>}
    </div>
  );
}
