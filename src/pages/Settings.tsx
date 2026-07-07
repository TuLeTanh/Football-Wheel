import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/stores/useSettingsStore';
import BackHeader from '@/components/BackHeader';
import type { ThemePreference } from '@/types';

const THEME_OPTIONS: ThemePreference[] = ['system', 'light', 'dark'];

/** PRD 10 – Settings: General (Language/Theme/Haptic/Sound/Animation) + About. */
export default function SettingsPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const {
    theme,
    resolvedTheme,
    language,
    hapticsEnabled,
    soundEnabled,
    reduceMotion,
    setTheme,
    setLanguage,
    setHapticsEnabled,
    setSoundEnabled,
    setReduceMotion
  } = useSettingsStore();

  function changeLanguage(lang: 'en' | 'vi') {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  }

  return (
    <div className={`app ${resolvedTheme}`}>
      <section className="shell">
        <BackHeader title={t('settings.title')} onBack={() => navigate('/home')} />

        <section className="settingsSection">
          <h3>{t('settings.general')}</h3>

          <div className="settingsRow">
            <span>{t('settings.language')}</span>
            <div className="segmented">
              <button className={language === 'vi' ? 'active' : ''} onClick={() => changeLanguage('vi')}>
                {t('settings.language.vi')}
              </button>
              <button className={language === 'en' ? 'active' : ''} onClick={() => changeLanguage('en')}>
                {t('settings.language.en')}
              </button>
            </div>
          </div>

          <div className="settingsRow">
            <span>{t('settings.theme')}</span>
            <div className="segmented">
              {THEME_OPTIONS.map((option) => (
                <button key={option} className={theme === option ? 'active' : ''} onClick={() => setTheme(option)}>
                  {t(`settings.theme.${option}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="settingsRow">
            <span>{t('settings.haptics')}</span>
            <button
              className={hapticsEnabled ? 'switch on' : 'switch'}
              role="switch"
              aria-checked={hapticsEnabled}
              onClick={() => setHapticsEnabled(!hapticsEnabled)}
            >
              <span className="switchKnob" />
            </button>
          </div>

          <div className="settingsRow">
            <span>{t('settings.sound')}</span>
            <button
              className={soundEnabled ? 'switch on' : 'switch'}
              role="switch"
              aria-checked={soundEnabled}
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              <span className="switchKnob" />
            </button>
          </div>

          <div className="settingsRow">
            <span>{t('settings.reduceMotion')}</span>
            <button
              className={reduceMotion ? 'switch on' : 'switch'}
              role="switch"
              aria-checked={reduceMotion}
              onClick={() => setReduceMotion(!reduceMotion)}
            >
              <span className="switchKnob" />
            </button>
          </div>
        </section>

        <section className="settingsSection">
          <h3>{t('settings.about')}</h3>
          <div className="settingsRow">
            <span>{t('settings.version')}</span>
            <span className="settingsValue">{t('settings.versionNumber')}</span>
          </div>
          <div className="settingsTextBlock">
            <strong>{t('settings.license')}</strong>
            <p>{t('settings.licenseBody')}</p>
          </div>
          <div className="settingsTextBlock">
            <strong>{t('settings.privacy')}</strong>
            <p>{t('settings.privacyBody')}</p>
          </div>
        </section>
      </section>
    </div>
  );
}
