import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Share2, Shuffle, Unlock, RotateCcw } from 'lucide-react';
import { findTeam, getAllTeams } from '@/data';
import { useSelectionStore } from '@/stores/useSelectionStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useHistoryStore } from '@/stores/useHistoryStore';
import { useStatisticsStore } from '@/stores/useStatisticsStore';
import { useToastStore } from '@/stores/useToastStore';
import { colorForTeam, initialsForTeam } from '@/utils/badge';
import { haptic } from '@/utils/haptics';
import { computeSpinTarget, pickRandomTeam } from '@/utils/randomEngine';
import WheelCanvas from '@/features/wheel/WheelCanvas';
import { buildIdleSlices, generateWheelSlices } from '@/features/wheel/wheelSliceGenerator';
import BackHeader from '@/components/BackHeader';
import ConfirmDialog from '@/components/ConfirmDialog';
import type { CategoryId, Team, WheelSlice as WheelSliceModel } from '@/types';

/**
 * PRD 6/7 – Wheel Screen + Wheel Behaviour: winner decided first, then a
 * 30-40 slice wheel is generated around it (wheelSliceGenerator), the SVG
 * wheel spins with easeOutQuint-like easing (WheelCanvas), and on stop we
 * reveal the winner, record it to History + Statistics, and offer
 * Lock / Spin again / Share.
 */
export default function WheelPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { category } = useParams<{ category: CategoryId }>();
  const cat = (category ?? 'club') as CategoryId;

  const resolvedTheme = useSettingsStore((s) => s.resolvedTheme);
  const selected = useSelectionStore((s) => s.selected[cat]);
  const locked = useSelectionStore((s) => s.locked[cat]);
  const lockTeam = useSelectionStore((s) => s.lockTeam);
  const unlockTeam = useSelectionStore((s) => s.unlockTeam);
  const unlockAll = useSelectionStore((s) => s.unlockAll);
  const getPool = useSelectionStore((s) => s.getPool);
  const addResult = useHistoryStore((s) => s.addResult);
  const recordSpin = useStatisticsStore((s) => s.recordSpin);
  const show = useToastStore((s) => s.show);

  const [winner, setWinner] = useState<Team | null>(null);
  const [wheelSlices, setWheelSlices] = useState<WheelSliceModel[]>([]);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [pendingWinner, setPendingWinner] = useState<Team | null>(null);
  const [showLocked, setShowLocked] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);

  const poolTeams = useMemo(
    () => getPool(cat).map((id) => findTeam(cat, id)).filter(Boolean) as Team[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cat, selected, locked]
  );
  const lockedTeams = useMemo(
    () => locked.map((id) => findTeam(cat, id)).filter(Boolean) as Team[],
    [cat, locked]
  );

  useEffect(() => {
    if (spinning) return;
    setWheelSlices(poolTeams.length > 0 ? buildIdleSlices(poolTeams) : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolTeams]);

  function spin() {
    if (spinning) return;
    if (poolTeams.length === 0) {
      show(t('wheel.noPool'), 'danger');
      return;
    }
    const next = pickRandomTeam(poolTeams);
    const slices = generateWheelSlices(poolTeams, next);
    const winnerIndex = slices.findIndex((slice) => slice.team.id === next.id);
    const target = computeSpinTarget(slices.length, winnerIndex, rotation);

    setWheelSlices(slices);
    setPendingWinner(next);
    setWinner(null);
    setSpinning(true);
    setRotation(target.finalRotation);
    haptic('selection');
  }

  function handleSpinComplete() {
    setSpinning(false);
    if (pendingWinner) {
      setWinner(pendingWinner);
      addResult({ teamId: pendingWinner.id, teamName: pendingWinner.name, teamCode: pendingWinner.code, category: cat });
      recordSpin(cat, pendingWinner.id);
      haptic('medium');
    }
    setPendingWinner(null);
  }

  function lockWinner() {
    if (!winner) return;
    lockTeam(cat, winner.id);
    haptic('soft');
  }

  function goShare() {
    if (!winner) return;
    navigate('/share', {
      state: { result: { teamId: winner.id, teamName: winner.name, teamCode: winner.code, category: cat } }
    });
  }

  function handleBack() {
    if (spinning) {
      setConfirmExit(true);
      return;
    }
    navigate(`/select/${cat}`);
  }

  const totalTeams = getAllTeams(cat).length;

  return (
    <div className={`app ${resolvedTheme}`}>
      <section className="shell">
        <BackHeader
          title={t(`category.${cat}`)}
          subtitle={t('wheel.title')}
          onBack={handleBack}
          action={
            locked.length > 0 ? (
              <button className="chip" onClick={() => setShowLocked(true)}>
                <Lock size={14} />
                {t('wheel.locked', { count: locked.length })}
              </button>
            ) : undefined
          }
        />

        <section className="wheelPanel" aria-live="polite">
          <div className="statusGrid">
            <div>
              <span>{selected.length}</span>
              <small>{t('wheel.selectedLabel')}</small>
            </div>
            <div>
              <span>{poolTeams.length}</span>
              <small>{t('wheel.remaining', { count: poolTeams.length })}</small>
            </div>
            <div>
              <span>{totalTeams}</span>
              <small>{t('home.teamsCount', { count: totalTeams })}</small>
            </div>
          </div>

          {wheelSlices.length > 0 ? (
            <WheelCanvas
              slices={wheelSlices}
              rotation={rotation}
              spinning={spinning}
              onSpinComplete={handleSpinComplete}
              size={300}
            />
          ) : (
            <div className="result">
              <div className="emptyResult">{t('wheel.noPool')}</div>
            </div>
          )}

          <div className="result">
            <AnimatePresence mode="wait">
              {winner ? (
                <motion.div
                  key={winner.id}
                  className="winnerReveal"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: [0.17, 0.67, 0.16, 0.99] }}
                >
                  <span className="badge badgeLarge" style={{ backgroundColor: colorForTeam(winner.id) }} aria-hidden="true">
                    {winner.code || initialsForTeam(winner.name)}
                  </span>
                  <div>
                    <p>{t('result.you.got')}</p>
                    <h2>{winner.name}</h2>
                    <span>{winner.region ?? t(`category.${winner.category}`)}</span>
                  </div>
                </motion.div>
              ) : (
                <div className="emptyResult">{spinning ? t('wheel.spinning') : t('wheel.readyToSpin')}</div>
              )}
            </AnimatePresence>
          </div>

          <div className="actions">
            <button className="primary" onClick={spin} disabled={spinning || poolTeams.length === 0}>
              <Shuffle size={20} />
              {spinning ? t('wheel.spinning') : winner ? t('wheel.spinAgain') : t('wheel.spin')}
            </button>
            {winner && (
              <>
                <button className="secondary" onClick={lockWinner} disabled={locked.includes(winner.id)}>
                  <Lock size={18} />
                  {t('wheel.lock')}
                </button>
                <button className="secondary" onClick={goShare}>
                  <Share2 size={18} />
                  {t('result.share')}
                </button>
              </>
            )}
          </div>
        </section>
      </section>

      <AnimatePresence>
        {showLocked && (
          <motion.div className="dialogOverlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLocked(false)}>
            <motion.div
              className="dialogCard"
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>{t('wheel.viewLocked')}</h3>
              {lockedTeams.length === 0 ? (
                <p>{t('wheel.lockedEmpty')}</p>
              ) : (
                <ul className="lockedList">
                  {lockedTeams.map((team) => (
                    <li key={team.id}>
                      <span className="badge" style={{ backgroundColor: colorForTeam(team.id) }} aria-hidden="true">
                        {team.code || initialsForTeam(team.name)}
                      </span>
                      <strong>{team.name}</strong>
                      <button
                        className="iconButton small"
                        aria-label={t('wheel.unlock') as string}
                        onClick={() => unlockTeam(cat, team.id)}
                      >
                        <RotateCcw size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="dialogActions">
                <button
                  className="secondary"
                  onClick={() => {
                    unlockAll(cat);
                  }}
                  disabled={lockedTeams.length === 0}
                >
                  <Unlock size={16} />
                  {t('wheel.unlockAll')}
                </button>
                <button className="primary" onClick={() => setShowLocked(false)}>
                  {t('common.done')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmExit}
        title={t('wheel.confirmExitTitle')}
        description={t('wheel.confirmExitBody')}
        danger
        onCancel={() => setConfirmExit(false)}
        onConfirm={() => {
          setConfirmExit(false);
          navigate(`/select/${cat}`);
        }}
      />
    </div>
  );
}
