import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import nlTranslation from "./locales/nl/translation.json";
import enTranslation from "./locales/en/translation.json";
import esTranslation from "./locales/es/translation.json";
import ptTranslation from "./locales/pt/translation.json";
import plTranslation from "./locales/pl/translation.json";
import hiTranslation from "./locales/hi/translation.json";
import itTranslation from "./locales/it/translation.json";
import frTranslation from "./locales/fr/translation.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: "nl",
    interpolation: {
      escapeValue: false,
    },
    resources: {
      nl: { translation: nlTranslation },
      en: { translation: enTranslation },
      es: { translation: esTranslation },
      pt: { translation: ptTranslation },
      pl: { translation: plTranslation },
      hi: { translation: hiTranslation },
      it: { translation: itTranslation },
      fr: { translation: frTranslation },
    },
  });

export default i18n;