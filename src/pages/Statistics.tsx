import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart2 } from 'lucide-react';
import { useStatisticsStore } from '@/stores/useStatisticsStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useToastStore } from '@/stores/useToastStore';
import { CATEGORIES, findTeam } from '@/data';
import { colorForTeam, initialsForTeam } from '@/utils/badge';
import BackHeader from '@/components/BackHeader';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import type { CategoryId } from '@/types';

/** PRD 9 – Statistics Screen: most-selected sort, category filter, independent Reset. */
export default function StatisticsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const resolvedTheme = useSettingsStore((s) => s.resolvedTheme);
  const totalSpins = useStatisticsStore((s) => s.totalSpins);
  const counts = useStatisticsStore((s) => s.counts);
  const resetStatistics = useStatisticsStore((s) => s.resetStatistics);
  const show = useToastStore((s) => s.show);

  const [filter, setFilter] = useState<CategoryId | 'all'>('all');
  const [confirmReset, setConfirmReset] = useState(false);

  const rows = useMemo(() => {
    const list = Object.values(counts)
      .filter((entry) => filter === 'all' || entry.category === filter)
      .map((entry) => ({ ...entry, team: findTeam(entry.category, entry.teamId) }))
      .filter((entry) => entry.team)
      .sort((a, b) => b.count - a.count);
    const max = list[0]?.count ?? 1;
    return list.map((entry) => ({ ...entry, pct: Math.round((entry.count / max) * 100) }));
  }, [counts, filter]);

  return (
    <div className={`app ${resolvedTheme}`}>
      <section className="shell">
        <BackHeader title={t('stats.title')} onBack={() => navigate('/home')} />

        <div className="statusGrid statsSummary">
          <div>
            <span>{totalSpins}</span>
            <small>{t('stats.totalSpins')}</small>
          </div>
          <div>
            <span>{rows[0]?.team?.name ?? '—'}</span>
            <small>{t('stats.mostDrawn')}</small>
          </div>
        </div>

        <div className="filterRow">
          <button className={filter === 'all' ? 'chip active' : 'chip'} onClick={() => setFilter('all')}>
            {t('stats.filter.all')}
          </button>
          {CATEGORIES.map((c) => (
            <button key={c.id} className={filter === c.id ? 'chip active' : 'chip'} onClick={() => setFilter(c.id)}>
              {t(`category.${c.id}`)}
            </button>
          ))}
        </div>

        {rows.length === 0 ? (
          <EmptyState icon={BarChart2} title={t('stats.empty')} />
        ) : (
          <div className="statsList">
            {rows.map((row) => (
              <div key={`${row.category}:${row.teamId}`} className="statsRow">
                <span className="badge" style={{ backgroundColor: colorForTeam(row.teamId) }} aria-hidden="true">
                  {row.team?.code || initialsForTeam(row.team?.name ?? '')}
                </span>
                <div className="statsRowMain">
                  <div className="statsRowHead">
                    <strong>{row.team?.name}</strong>
                    <span>{t('stats.appearances', { count: row.count })}</span>
                  </div>
                  <div className="statsBarTrack">
                    <div className="statsBarFill" style={{ width: `${row.pct}%`, backgroundColor: colorForTeam(row.teamId) }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {rows.length > 0 && (
          <button className="secondary danger block" onClick={() => setConfirmReset(true)}>
            {t('stats.reset')}
          </button>
        )}
      </section>

      <ConfirmDialog
        open={confirmReset}
        title={t('stats.resetConfirmTitle')}
        description={t('stats.resetConfirmBody')}
        danger
        confirmLabel={t('common.reset') as string}
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetStatistics();
          show(t('toast.statsReset'));
          setConfirmReset(false);
        }}
      />
    </div>
  );
}
