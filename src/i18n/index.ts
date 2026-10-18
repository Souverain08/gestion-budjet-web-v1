import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { STORAGE_KEYS, SUPPORTED_LOCALES, type Locale } from '../constants/app.constants';
import { storage } from '../services/storage/storageService';
import { en } from './locales/en';
import { fr } from './locales/fr';

function initialLocale(): Locale {
  const saved = storage.get(STORAGE_KEYS.locale);
  if (saved && (SUPPORTED_LOCALES as readonly string[]).includes(saved)) return saved as Locale;
  return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'fr';
}

void i18n.use(initReactI18next).init({
  resources: { fr: { translation: fr }, en: { translation: en } },
  lng: initialLocale(),
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  storage.set(STORAGE_KEYS.locale, lng);
});
document.documentElement.lang = i18n.language;

export default i18n;
