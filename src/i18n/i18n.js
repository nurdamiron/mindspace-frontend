// i18next — көп тілді аударманы басқаратын кітапхана
import i18n from 'i18next';
// initReactI18next — i18next-ті React-пен байланыстыратын плагин
import { initReactI18next } from 'react-i18next';
// LanguageDetector — браузер тілін автоматты анықтайтын плагин
import LanguageDetector from 'i18next-browser-languagedetector';
// ru — орыс тіліндегі аударма файлы
import ru from './locales/ru/translation.json';
// kk — қазақ тіліндегі аударма файлы
import kk from './locales/kk/translation.json';

// i18n инициализациясы: тіл анықтау, React плагині және ресурстар тіркеу
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Орыс және қазақ тілдерінің аударма ресурстары
    resources: { ru: { translation: ru }, kk: { translation: kk } },
    // Аудармасы жоқ жағдайда орыс тіліне қайту
    fallbackLng: 'ru',
    supportedLngs: ['ru', 'kk'],
    interpolation: { escapeValue: false },
    // Тілді localStorage-тен немесе браузер параметрінен анықтау
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
