import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, X, SearchX, RotateCcw } from 'lucide-react';
import { getAllTeams } from '@/data';
import { useSelectionStore } from '@/stores/useSelectionStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { haptic } from '@/utils/haptics';
import { useToastStore } from '@/stores/useToastStore';
import BackHeader from '@/components/BackHeader';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import TeamBadge from '@/components/TeamBadge';
import type { CategoryId, Team } from '@/types';

/**
 * PRD 5 – Team Selection Screen: search always on top + realtime filter,
 * checkbox always left of the badge, Continue disabled while Selected = 0.
 */
export default function Selection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { category } = useParams<{ category: CategoryId }>();
  const cat = (category ?? 'club') as CategoryId;

  const [query, setQuery] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const resolvedTheme = useSettingsStore((s) => s.resolvedTheme);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const selected = useSelectionStore((s) => s.selected[cat]);
  const toggleTeam = useSelectionStore((s) => s.toggleTeam);
  const selectAll = useSelectionStore((s) => s.selectAll);
  const clearAll = useSelectionStore((s) => s.clearAll);
  const show = useToastStore((s) => s.show);

  const teams = getAllTeams(cat);
  const visibleTeams = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return teams;
    return teams.filter((team) =>
      [team.name, team.code, team.region].filter(Boolean).join(' ').toLowerCase().includes(needle)
    );
  }, [query, teams]);

  function handleContinue() {
    if (selected.length === 0) return;
    haptic('light');
    navigate(`/wheel/${cat}`);
  }

  return (
    <div className={`app ${resolvedTheme}${reduceMotion ? ' reduceMotion' : ''}`}>
      <section className="shell">
        <BackHeader
          title={t(`category.${cat}`)}
          subtitle={t('selection.title')}
          onBack={() => navigate('/home')}
          action={
            <button className="iconButton" aria-label={t('selection.reset') as string} onClick={() => setConfirmReset(true)}>
              <RotateCcw size={18} />
            </button>
          }
        />

        <section className="listPanel">
          <div className="listTools">
            <label className="searchBox">
              <Search size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('selection.search') as string}
                autoComplete="off"
              />
              {query && (
                <button
                  type="button"
                  className="searchClear"
                  aria-label={t('selection.searchClear') as string}
                  onClick={() => setQuery('')}
                >
                  <X size={16} />
                </button>
              )}
            </label>
            <button
              onClick={() => {
                selectAll(cat);
                show(t('toast.selectionUpdated'));
              }}
            >
              {t('selection.selectAll')}
            </button>
            <button
              onClick={() => {
                clearAll(cat);
                show(t('toast.selectionUpdated'));
              }}
            >
              {t('selection.clearAll')}
            </button>
          </div>

          {visibleTeams.length === 0 ? (
            <EmptyState icon={SearchX} title={t('selection.empty')} />
          ) : (
            <div className="teamList" role="listbox" aria-multiselectable="true">
              {visibleTeams.map((team: Team) => {
                const isSelected = selected.includes(team.id);
                return (
                  <button
                    key={team.id}
                    role="option"
                    aria-selected={isSelected}
                    className={isSelected ? 'team selected' : 'team'}
                    onClick={() => {
                      toggleTeam(cat, team.id);
                      haptic('selection');
                    }}
                  >
                    <span className={isSelected ? 'checkbox checked' : 'checkbox'} aria-hidden="true" />
                    <TeamBadge teamId={team.id} name={team.name} code={team.code} />
                    <span className="teamText">
                      <strong>{team.name}</strong>
                      <small>{team.region ?? team.code}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <div className="selectionFooter">
          <p>{t('selection.selectedCount', { count: selected.length })}</p>
          <button className="primary block" disabled={selected.length === 0} onClick={handleContinue}>
            {t('selection.continue')}
          </button>
        </div>
      </section>

      <ConfirmDialog
        open={confirmReset}
        title={t('selection.resetConfirmTitle')}
        description={t('selection.resetConfirmBody')}
        confirmLabel={t('selection.reset') as string}
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          selectAll(cat);
          setConfirmReset(false);
          show(t('toast.selectionUpdated'));
        }}
      />
    </div>
  );
}
