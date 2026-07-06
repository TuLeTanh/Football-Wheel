import { useEffect, useMemo, useState } from 'react';
import { Lock, Moon, RotateCcw, Search, Shuffle, Sun, Unlock } from 'lucide-react';
import { CATEGORIES, findTeam, getAllTeams } from '@/data';
import { useSelectionStore } from '@/stores/useSelectionStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { colorForTeam, initialsForTeam } from '@/utils/badge';
import { haptic } from '@/utils/haptics';
import { computeSpinTarget, pickRandomTeam } from '@/utils/randomEngine';
import WheelCanvas from '@/features/wheel/WheelCanvas';
import { buildIdleSlices, generateWheelSlices } from '@/features/wheel/wheelSliceGenerator';
import type { CategoryId, Team, WheelSlice as WheelSliceModel } from '@/types';

const CATEGORY_LABELS: Record<CategoryId, string> = {
  club: 'Club',
  national: 'National Team',
  legend: 'Legend Club'
};

function TeamBadge({ team, large = false }: { team: Team; large?: boolean }) {
  return (
    <span
      className={large ? 'badge badgeLarge' : 'badge'}
      style={{ backgroundColor: colorForTeam(team.id) }}
      aria-hidden="true"
    >
      {team.code || initialsForTeam(team.name)}
    </span>
  );
}

export default function App() {
  const [category, setCategory] = useState<CategoryId>('club');
  const [query, setQuery] = useState('');
  const [winner, setWinner] = useState<Team | null>(null);
  const [message, setMessage] = useState('Pick a pool, then spin.');

  const [wheelSlices, setWheelSlices] = useState<WheelSliceModel[]>([]);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [pendingWinner, setPendingWinner] = useState<Team | null>(null);

  const theme = useSettingsStore((s) => s.theme);
  const toggleTheme = useSettingsStore((s) => s.toggleTheme);
  const selected = useSelectionStore((s) => s.selected[category]);
  const locked = useSelectionStore((s) => s.locked[category]);
  const toggleTeam = useSelectionStore((s) => s.toggleTeam);
  const selectAll = useSelectionStore((s) => s.selectAll);
  const clearAll = useSelectionStore((s) => s.clearAll);
  const lockTeam = useSelectionStore((s) => s.lockTeam);
  const unlockTeam = useSelectionStore((s) => s.unlockTeam);
  const unlockAll = useSelectionStore((s) => s.unlockAll);
  const getPool = useSelectionStore((s) => s.getPool);

  const teams = getAllTeams(category);
  const visibleTeams = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return teams;
    return teams.filter((team) =>
      [team.name, team.code, team.region].filter(Boolean).join(' ').toLowerCase().includes(needle)
    );
  }, [query, teams]);

  // Stable reference: only recomputes when the actual selection/lock state
  // for this category changes, not on every render (getPool() itself always
  // returns a fresh array).
  const poolTeams = useMemo(
    () => getPool(category).map((id) => findTeam(category, id)).filter(Boolean) as Team[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [category, selected, locked]
  );

  // Keep an idle preview wheel in sync with the current pool whenever the
  // user isn't mid-spin (switching category/tab, checking/unchecking teams).
  // NOTE: only depends on `poolTeams` — NOT `spinning`. If `spinning` were a
  // dependency, this effect re-fires the instant a spin finishes and wipes
  // out the winner we just revealed in handleSpinComplete().
  useEffect(() => {
    if (spinning) return;
    setWheelSlices(poolTeams.length > 0 ? buildIdleSlices(poolTeams) : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolTeams]);

  function spin() {
    if (spinning) return;
    if (poolTeams.length === 0) {
      setWinner(null);
      setMessage('No available teams. Select or unlock at least one team.');
      return;
    }

    // PRD 3.18: decide the winner FIRST, then build the 30-40 slice wheel
    // around it, then spin the SVG wheel so the pointer lands on it.
    const next = pickRandomTeam(poolTeams);
    const slices = generateWheelSlices(poolTeams, next);
    const winnerIndex = slices.findIndex((slice) => slice.team.id === next.id);
    const target = computeSpinTarget(slices.length, winnerIndex, rotation);

    setWheelSlices(slices);
    setPendingWinner(next);
    setWinner(null);
    setSpinning(true);
    setMessage('Spinning...');
    setRotation(target.finalRotation);
    haptic('selection');
  }

  function handleSpinComplete() {
    setSpinning(false);
    if (pendingWinner) {
      setWinner(pendingWinner);
      setMessage(`${pendingWinner.name} wins the draw.`);
      haptic('medium');
    }
    setPendingWinner(null);
  }

  function lockWinner() {
    if (!winner) return;
    lockTeam(category, winner.id);
    setMessage(`${winner.name} locked out of the next spins.`);
    haptic('soft');
  }

  return (
    <main className={`app ${theme}`}>
      <section className="shell">
        <header className="topbar">
          <div>
            <p className="eyebrow">eFootball companion</p>
            <h1>Team Wheel</h1>
          </div>
          <button className="iconButton" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <div className="tabs" role="tablist" aria-label="Team category">
          {CATEGORIES.map((item) => (
            <button
              key={item.id}
              className={item.id === category ? 'tab active' : 'tab'}
              onClick={() => {
                setCategory(item.id);
                setWinner(null);
                setQuery('');
                setMessage(`Switched to ${CATEGORY_LABELS[item.id]}.`);
              }}
            >
              {CATEGORY_LABELS[item.id]}
            </button>
          ))}
        </div>

        <section className="wheelPanel" aria-live="polite">
          <div className="statusGrid">
            <div>
              <span>{selected.length}</span>
              <small>selected</small>
            </div>
            <div>
              <span>{locked.length}</span>
              <small>locked</small>
            </div>
            <div>
              <span>{poolTeams.length}</span>
              <small>ready</small>
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
              <div className="emptyResult">Select at least one team to build the wheel</div>
            </div>
          )}

          <div className="result">
            {winner ? (
              <div className="winnerReveal">
                <TeamBadge team={winner} large />
                <div>
                  <p>Result</p>
                  <h2>{winner.name}</h2>
                  <span>{winner.region ?? CATEGORY_LABELS[winner.category]}</span>
                </div>
              </div>
            ) : (
              <div className="emptyResult">{spinning ? 'Spinning...' : 'Ready to spin'}</div>
            )}
          </div>

          <p className="message">{message}</p>

          <div className="actions">
            <button className="primary" onClick={spin} disabled={spinning}>
              <Shuffle size={20} />
              Spin
            </button>
            <button className="secondary" onClick={lockWinner} disabled={!winner || spinning}>
              <Lock size={18} />
              Lock result
            </button>
            <button className="secondary" onClick={() => unlockAll(category)} disabled={spinning}>
              <Unlock size={18} />
              Unlock all
            </button>
          </div>
        </section>

        <section className="listPanel">
          <div className="listTools">
            <label className="searchBox">
              <Search size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search teams"
              />
            </label>
            <button onClick={() => selectAll(category)}>All</button>
            <button onClick={() => clearAll(category)}>None</button>
          </div>

          <div className="teamList">
            {visibleTeams.map((team) => {
              const isSelected = selected.includes(team.id);
              const isLocked = locked.includes(team.id);
              return (
                <article key={team.id} className={isSelected ? 'team selected' : 'team'}>
                  <button className="teamMain" onClick={() => toggleTeam(category, team.id)}>
                    <TeamBadge team={team} />
                    <span>
                      <strong>{team.name}</strong>
                      <small>{team.region ?? team.code}</small>
                    </span>
                  </button>
                  <button
                    className="iconButton small"
                    onClick={() => (isLocked ? unlockTeam(category, team.id) : lockTeam(category, team.id))}
                    aria-label={isLocked ? `Unlock ${team.name}` : `Lock ${team.name}`}
                  >
                    {isLocked ? <Lock size={17} /> : <RotateCcw size={17} />}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}