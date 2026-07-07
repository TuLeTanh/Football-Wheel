import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, Trash2 } from 'lucide-react';
import { useHistoryStore, groupHistoryByDay } from '@/stores/useHistoryStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useToastStore } from '@/stores/useToastStore';
import { colorForTeam, initialsForTeam } from '@/utils/badge';
import { haptic } from '@/utils/haptics';
import BackHeader from '@/components/BackHeader';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import type { SpinResult } from '@/types';

const LONG_PRESS_MS = 500;

/** PRD 8 – History Screen: grouped by day, capped at 50, tap opens detail, long-press deletes. */
export default function HistoryPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const resolvedTheme = useSettingsStore((s) => s.resolvedTheme);
  const results = useHistoryStore((s) => s.results);
  const deleteResult = useHistoryStore((s) => s.deleteResult);
  const clearHistory = useHistoryStore((s) => s.clearHistory);
  const show = useToastStore((s) => s.show);

  const [pendingDelete, setPendingDelete] = useState<SpinResult | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const groups = useMemo(() => groupHistoryByDay(results), [results]);

  function startPress(item: SpinResult) {
    pressTimer.current = setTimeout(() => {
      haptic('soft');
      setPendingDelete(item);
    }, LONG_PRESS_MS);
  }
  function cancelPress() {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  }

  return (
    <div className={`app ${resolvedTheme}`}>
      <section className="shell">
        <BackHeader
          title={t('history.title')}
          onBack={() => navigate('/home')}
          action={
            results.length > 0 ? (
              <button className="iconButton" aria-label={t('history.clear') as string} onClick={() => setConfirmClear(true)}>
                <Trash2 size={18} />
              </button>
            ) : undefined
          }
        />

        {results.length === 0 ? (
          <EmptyState icon={Clock} title={t('history.empty.title')} body={t('history.empty.body')} />
        ) : (
          <>
            <p className="hint">{t('history.deleteHint')}</p>
            <div className="historyGroups">
              {groups.map((group) => (
                <section key={group.key} className="historyGroup">
                  <h3>{group.label === 'today' ? t('history.today') : group.label === 'yesterday' ? t('history.yesterday') : group.date}</h3>
                  <div className="historyList">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        className="historyCard"
                        onMouseDown={() => startPress(item)}
                        onMouseUp={cancelPress}
                        onMouseLeave={cancelPress}
                        onTouchStart={() => startPress(item)}
                        onTouchEnd={cancelPress}
                      >
                        <span className="badge" style={{ backgroundColor: colorForTeam(item.teamId) }} aria-hidden="true">
                          {item.teamCode || initialsForTeam(item.teamName)}
                        </span>
                        <span className="historyCardText">
                          <strong>{item.teamName}</strong>
                          <small>{t(`category.${item.category}`)} · {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </section>

      <ConfirmDialog
        open={!!pendingDelete}
        title={t('history.deleteConfirmTitle')}
        description={t('history.deleteConfirmBody')}
        danger
        confirmLabel={t('common.delete') as string}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            deleteResult(pendingDelete.id);
            show(t('toast.historyItemDeleted'));
          }
          setPendingDelete(null);
        }}
      />

      <ConfirmDialog
        open={confirmClear}
        title={t('history.clearConfirmTitle')}
        description={t('history.clearConfirmBody')}
        danger
        confirmLabel={t('history.clear') as string}
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          clearHistory();
          show(t('toast.historyCleared'));
          setConfirmClear(false);
        }}
      />
    </div>
  );
}
