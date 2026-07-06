import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import vi from './vi.json';
import { safeStorage } from '@/utils/storage';

const STORAGE_KEY = 'team-wheel:lang';
const savedLang = safeStorage.getItem(STORAGE_KEY);
const browserLang = typeof navigator !== 'undefined' && navigator.language?.startsWith('vi') ? 'vi' : 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    vi: { translation: vi }
  },
  lng: savedLang ?? browserLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

i18n.on('languageChanged', (lng) => {
  safeStorage.setItem(STORAGE_KEY, lng);
  document.documentElement.lang = lng;
});

export default i18n;
