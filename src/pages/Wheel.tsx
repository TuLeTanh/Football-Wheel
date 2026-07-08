import { useEffect, useMemo, useState, type CSSProperties } from 'react';
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
import { colorForTeam } from '@/utils/badge';
import { haptic } from '@/utils/haptics';
import { playSound } from '@/utils/sound';
import { computeSpinTarget, pickRandomTeam } from '@/utils/randomEngine';
import WheelCanvas from '@/features/wheel/WheelCanvas';
import { buildIdleSlices, generateWheelSlices } from '@/features/wheel/wheelSliceGenerator';
import BackHeader from '@/components/BackHeader';
import ConfirmDialog from '@/components/ConfirmDialog';
import TeamBadge from '@/components/TeamBadge';
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
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
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
  const [fastSpin, setFastSpin] = useState(false);
  const [pendingWinner, setPendingWinner] = useState<Team | null>(null);
  const [showLocked, setShowLocked] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [pendingUnlock, setPendingUnlock] = useState<Team | 'all' | null>(null);

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

  // FR-008 – "Nếu đang quay -> Không cho Back": while the wheel is spinning,
  // swallow the hardware/browser Back gesture and surface the same exit
  // confirmation used for the in-app Back button instead of leaving the page.
  useEffect(() => {
    if (!spinning) return;
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
      setConfirmExit(true);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [spinning]);

  function spin() {
    if (spinning) return;
    if (poolTeams.length === 0) {
      show(t('wheel.noPool'), 'danger');
      return;
    }
    haptic('light');
    playSound('spin');

    // FR-006 – if only one team remains in the pool there's nothing to
    // decide: skip the wheel entirely and reveal after a short ~800ms beat
    // instead of a full 3.5s spin.
    if (poolTeams.length === 1) {
      const only = poolTeams[0];
      setWinner(null);
      setPendingWinner(only);
      setFastSpin(true);
      setSpinning(true);
      window.setTimeout(() => {
        setSpinning(false);
        setFastSpin(false);
        resolveWinner(only);
      }, 800);
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
  }

  function resolveWinner(team: Team) {
    setWinner(team);
    addResult({ teamId: team.id, teamName: team.name, teamCode: team.code, category: cat });
    recordSpin(cat, team.id);
    haptic('medium');
    playSound('winner');
    setPendingWinner(null);
  }

  function handleSpinComplete() {
    setSpinning(false);
    if (pendingWinner) resolveWinner(pendingWinner);
  }

  function lockWinner() {
    if (!winner) return;
    lockTeam(cat, winner.id);
    haptic('soft');
    playSound('lock');
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
  const tintColor = winner ? colorForTeam(winner.id) : undefined;

  return (
    <div
      className={`app wheelPage ${resolvedTheme}${winner ? ' teamTinted' : ''}${reduceMotion ? ' reduceMotion' : ''}`}
      style={tintColor ? ({ '--team-tint': tintColor } as CSSProperties) : undefined}
    >
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

          {fastSpin && pendingWinner ? (
            <motion.div
              className="wheelStage fastSpinPulse"
              style={{ width: 300, height: 300 }}
              animate={reduceMotion ? undefined : { scale: [1, 1.06, 1] }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            >
              <TeamBadge teamId={pendingWinner.id} name={pendingWinner.name} code={pendingWinner.code} size="large" />
            </motion.div>
          ) : wheelSlices.length > 0 ? (
            <WheelCanvas
              slices={wheelSlices}
              rotation={rotation}
              spinning={spinning}
              reduceMotion={reduceMotion}
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
                  <TeamBadge teamId={winner.id} name={winner.name} code={winner.code} size="large" />
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
            <motion.button
              className="primary"
              onClick={spin}
              disabled={spinning || poolTeams.length === 0}
              whileTap={reduceMotion ? undefined : { scale: 0.94 }}
              transition={{ duration: 0.1, ease: 'easeOut' }}
            >
              <Shuffle size={20} />
              {spinning ? t('wheel.spinning') : winner ? t('wheel.spinAgain') : t('wheel.spin')}
            </motion.button>
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
                      <TeamBadge teamId={team.id} name={team.name} code={team.code} />
                      <strong>{team.name}</strong>
                      <button
                        className="iconButton small"
                        aria-label={t('wheel.unlock') as string}
                        onClick={() => setPendingUnlock(team)}
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
                  onClick={() => setPendingUnlock('all')}
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

      <ConfirmDialog
        open={pendingUnlock !== null}
        title={t('wheel.confirmUnlockTitle')}
        onCancel={() => setPendingUnlock(null)}
        onConfirm={() => {
          if (pendingUnlock === 'all') unlockAll(cat);
          else if (pendingUnlock) unlockTeam(cat, pendingUnlock.id);
          setPendingUnlock(null);
        }}
      />
    </div>
  );
}
