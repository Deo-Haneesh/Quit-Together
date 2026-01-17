import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from './locales/en.json';
import es from './locales/es.json';
import hi from './locales/hi.json';
import ar from './locales/ar.json';

const resources = {
    en: { translation: en },
    es: { translation: es },
    hi: { translation: hi },
    ar: { translation: ar }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        supportedLngs: ['en', 'es', 'hi', 'ar'],

        interpolation: {
            escapeValue: false // React already handles escaping
        },

        detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage'],
            lookupLocalStorage: 'qt_language'
        }
    });

// Update document direction for RTL languages
i18n.on('languageChanged', (lng) => {
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    const dir = rtlLanguages.includes(lng) ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lng;
});

export default i18n;
