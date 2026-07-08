import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shuffle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * PRD 2.2 / 3 – Splash: loads settings/history/stats (handled by the
 * persisted Zustand stores as soon as the module graph evaluates), then
 * hands off to Home in well under the 1.5s launch budget (PRD 1.5).
 */
export default function Splash() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/home', { replace: true }), 1200);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splashScreen">
      <div className="splashLogo">
        <Shuffle size={44} />
      </div>
      <h1>{t('app.name')}</h1>
      <p>{t('app.tagline')}</p>
      <div className="splashSpinner" aria-hidden="true" />
    </div>
  );
}
