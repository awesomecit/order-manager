// i18n Configuration
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import traduzioni
import translationEN from './locales/en/translation.json'
import translationIT from './locales/it/translation.json'
import translationES from './locales/es/translation.json'
import translationFR from './locales/fr/translation.json'
import translationDE from './locales/de/translation.json'

// Risorse di traduzione
const resources = {
  en: {
    translation: translationEN
  },
  it: {
    translation: translationIT
  },
  es: {
    translation: translationES
  },
  fr: {
    translation: translationFR
  },
  de: {
    translation: translationDE
  }
}

i18n
  // Rileva automaticamente la lingua del browser
  .use(LanguageDetector)
  // Passa l'istanza i18n a react-i18next
  .use(initReactI18next)
  // Inizializza i18next
  .init({
    resources,
    fallbackLng: 'en', // Lingua di fallback se quella rilevata non è disponibile
    debug: import.meta.env.MODE === 'development', // Debug in development
    
    interpolation: {
      escapeValue: false // React già fa l'escape
    },

    detection: {
      // Ordine di rilevamento della lingua
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'], // Salva la scelta dell'utente
      lookupLocalStorage: 'i18nextLng'
    },

    // Namespace (per organizzare le traduzioni)
    defaultNS: 'translation',
    ns: ['translation']
  })

export default i18n

// Tipi TypeScript per le chiavi di traduzione
export type TranslationKeys = typeof translationEN
