import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, BarChart2, Settings as SettingsIcon, Shuffle, ChevronRight, Trophy, Globe, Sparkles } from 'lucide-react';
import { CATEGORIES, getAllTeams } from '@/data';
import { haptic } from '@/utils/haptics';
import { useSettingsStore } from '@/stores/useSettingsStore';

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  club: <Trophy size={20} />,
  national: <Globe size={20} />,
  legend: <Sparkles size={20} />
};

const CATEGORY_COLOR: Record<string, string> = {
  club: 'var(--color-primary)',
  national: 'var(--color-success)',
  legend: 'var(--color-warning)'
};

/**
 * PRD 4 – Home Screen: Home Hub navigation, no bottom nav / hamburger.
 * Deliberately minimal — logo, 3 category entries, then History/Statistics/Settings.
 * No ads, no banners, no colorful cards (PRD explicit "no quang cao / no banner").
 */
export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const resolvedTheme = useSettingsStore((s) => s.resolvedTheme);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  function go(path: string) {
    haptic('light');
    navigate(path);
  }

  return (
    <div className={`app ${resolvedTheme}${reduceMotion ? ' reduceMotion' : ''}`}>
      <section className="shell homeShell">
        <header className="homeLogo">
          <div className="homeLogoMark">
            <Shuffle size={26} />
          </div>
          <div className="homeLogoTitle">
            <h1>{t('app.name')}</h1>
            <p>{t('home.subtitle')}</p>
          </div>
        </header>

        <div className="homeCategories">
          {CATEGORIES.map((item) => (
            <button
              key={item.id}
              className="homeCategoryCard"
              style={{ '--category-color': CATEGORY_COLOR[item.id] } as React.CSSProperties}
              onClick={() => go(`/select/${item.id}`)}
            >
              <div className="homeCategoryIconContainer" aria-hidden="true">
                {CATEGORY_ICON[item.id]}
              </div>
              <span className="homeCategoryText">
                <strong>{t(`category.${item.id}`)}</strong>
                <small>{t('home.teamsCount', { count: getAllTeams(item.id).length })}</small>
              </span>
              <ChevronRight size={20} />
            </button>
          ))}
        </div>

        <nav className="homeHub" aria-label="Utility">
          <button onClick={() => go('/history')}>
            <Clock size={20} />
            {t('home.history')}
          </button>
          <button onClick={() => go('/stats')}>
            <BarChart2 size={20} />
            {t('home.statistics')}
          </button>
          <button onClick={() => go('/settings')}>
            <SettingsIcon size={20} />
            {t('home.settings')}
          </button>
        </nav>
      </section>
    </div>
  );
}
