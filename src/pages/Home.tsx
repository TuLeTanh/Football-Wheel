import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, BarChart2, Settings as SettingsIcon, Shuffle, ChevronRight } from 'lucide-react';
import { CATEGORIES, getAllTeams } from '@/data';
import { haptic } from '@/utils/haptics';
import { useSettingsStore } from '@/stores/useSettingsStore';

const CATEGORY_ICON: Record<string, string> = { club: '⚽', national: '🌍', legend: '⭐' };

/**
 * PRD 4 – Home Screen: Home Hub navigation, no bottom nav / hamburger.
 * Deliberately minimal — logo, 3 category entries, then History/Statistics/Settings.
 * No ads, no banners, no colorful cards (PRD explicit "no quang cao / no banner").
 */
export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const resolvedTheme = useSettingsStore((s) => s.resolvedTheme);

  function go(path: string) {
    haptic('light');
    navigate(path);
  }

  return (
    <div className={`app ${resolvedTheme}`}>
      <section className="shell homeShell">
        <header className="homeLogo">
          <div className="homeLogoMark">
            <Shuffle size={28} />
          </div>
          <h1>{t('app.name')}</h1>
          <p>{t('home.subtitle')}</p>
        </header>

        <div className="homeCategories">
          {CATEGORIES.map((item) => (
            <button key={item.id} className="homeCategoryCard" onClick={() => go(`/select/${item.id}`)}>
              <span className="homeCategoryEmoji" aria-hidden="true">
                {CATEGORY_ICON[item.id]}
              </span>
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
