# 🌍 i18n (Internationalization) - Guida Completa

## 📋 Panoramica

**i18n (internationalization)** è stato implementato usando **react-i18next**, la soluzione standard per React. Il sistema supporta **5 lingue**:

- 🇬🇧 **English** (en) - Lingua di fallback
- 🇮🇹 **Italiano** (it)
- 🇪🇸 **Español** (es)
- 🇫🇷 **Français** (fr)
- 🇩🇪 **Deutsch** (de)

## 🚀 Come Funziona

### Auto-rilevamento Lingua
Il sistema rileva automaticamente la lingua del browser dell'utente e applica la traduzione corrispondente. Se la lingua non è supportata, usa l'inglese come fallback.

### Persistenza
La scelta della lingua viene salvata in `localStorage`, quindi viene ricordata tra le sessioni.

## 📁 Struttura File

```
frontend/
├── i18n.ts                          # Configurazione i18next
├── locales/                         # File di traduzione
│   ├── en/translation.json          # Inglese
│   ├── it/translation.json          # Italiano
│   ├── es/translation.json          # Spagnolo
│   ├── fr/translation.json          # Francese
│   └── de/translation.json          # Tedesco
└── components/
    ├── LanguageSelector.tsx         # Componente selezione lingua
    └── login-component.tsx          # Esempio uso i18n
```

## 🔧 Configurazione

### 1. Installazione Pacchetti
```bash
npm install --save i18next react-i18next i18next-browser-languagedetector
```

### 2. Inizializzazione (i18n.ts)
```typescript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { /* traduzioni */ },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })
```

### 3. Import in main.tsx
```typescript
import './i18n' // Inizializza i18n
```

## 🎯 Come Usare

### In un Componente React

```typescript
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('auth.login.title')}</h1>
      <p>{t('auth.login.email')}</p>
    </div>
  )
}
```

### Con Interpolazione

```typescript
// File JSON
{
  "welcome": "Hello, {{name}}!"
}

// Componente
{t('welcome', { name: 'Mario' })}
// Output: "Hello, Mario!"
```

### Con Pluralizzazione

```typescript
// File JSON
{
  "items": "You have {{count}} item",
  "items_plural": "You have {{count}} items"
}

// Componente
{t('items', { count: 1 })}  // "You have 1 item"
{t('items', { count: 5 })}  // "You have 5 items"
```

### Cambiare Lingua Programmaticamente

```typescript
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { i18n } = useTranslation()
  
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
  }
  
  return (
    <button onClick={() => changeLanguage('it')}>
      Cambia in Italiano
    </button>
  )
}
```

## 📝 Struttura File di Traduzione

### Schema JSON
```json
{
  "auth": {
    "login": {
      "title": "Login",
      "email": "Email",
      "password": "Password",
      "submit": "Sign In"
    },
    "signup": {
      "title": "Sign Up",
      "name": "Full name",
      "submit": "Sign Up"
    }
  },
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "success": "Success"
  }
}
```

### Organizzazione per Namespace
- `auth.*` - Autenticazione (login, signup, OAuth)
- `common.*` - Testi comuni riutilizzabili
- `validation.*` - Messaggi di validazione
- `messages.*` - Messaggi di successo/errore

## 🎨 Componente LanguageSelector

### Uso
```tsx
import LanguageSelector from './LanguageSelector'

function App() {
  return (
    <div>
      <LanguageSelector />
      {/* resto dell'app */}
    </div>
  )
}
```

### Features
- ✅ Dropdown con bandiere emoji
- ✅ Indica lingua corrente con ✓
- ✅ Cambia lingua al click
- ✅ Salva in localStorage
- ✅ Design responsive (DaisyUI)

## 🧪 Testing con i18n

### Setup Test
```typescript
import { render } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n'

function renderWithI18n(component: React.ReactElement) {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  )
}

test('renders translated text', () => {
  const { getByText } = renderWithI18n(<LoginComponent />)
  expect(getByText(/login/i)).toBeInTheDocument()
})
```

### Mock Traduzioni nei Test
```typescript
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en'
    }
  })
}))
```

## 🌐 Aggiungere una Nuova Lingua

### 1. Crea il file JSON
```bash
mkdir -p locales/pt
cp locales/en/translation.json locales/pt/translation.json
```

### 2. Traduci il contenuto
Modifica `locales/pt/translation.json` con le traduzioni portoghesi.

### 3. Aggiorna i18n.ts
```typescript
import translationPT from './locales/pt/translation.json'

const resources = {
  en: { translation: translationEN },
  it: { translation: translationIT },
  pt: { translation: translationPT }  // Aggiungi qui
}
```

### 4. Aggiorna LanguageSelector
```typescript
const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' }  // Aggiungi qui
]
```

## 📊 Best Practices

### 1. Chiavi Descrittive
```typescript
// ❌ Cattivo
{t('btn1')}

// ✅ Buono
{t('auth.login.submit')}
```

### 2. Raggruppa per Contesto
```json
{
  "auth": {
    "login": { /* ... */ },
    "signup": { /* ... */ }
  },
  "dashboard": {
    "header": { /* ... */ }
  }
}
```

### 3. Usa Namespace per Moduli Grandi
```typescript
// i18n.ts
ns: ['auth', 'dashboard', 'settings'],
defaultNS: 'auth'

// Componente
const { t } = useTranslation('dashboard')
{t('header.title')}  // Legge da dashboard namespace
```

### 4. Evita Hardcoded Text
```typescript
// ❌ Mai fare così
<button>Login</button>

// ✅ Sempre usare i18n
<button>{t('auth.login.submit')}</button>
```

### 5. Traduzioni Context-Aware
```json
{
  "auth": {
    "login": {
      "title": "Login",
      "loading": "Signing in..."
    },
    "signup": {
      "title": "Sign Up",
      "loading": "Creating account..."
    }
  }
}
```

## 🔍 Debugging

### Console Logging
```typescript
// i18n.ts
.init({
  debug: import.meta.env.MODE === 'development',
  // ...
})
```

Vedrai nella console:
```
i18next::init: languageDetected -> it
i18next::loaded namespace translation for language it
```

### Visualizza Lingua Corrente
```typescript
import { useTranslation } from 'react-i18next'

function Debug() {
  const { i18n } = useTranslation()
  
  console.log('Current language:', i18n.language)
  console.log('Available languages:', i18n.languages)
  
  return null
}
```

### Missing Translation Warning
Se una chiave non esiste, i18next mostra:
```
i18next::translator: missingKey it translation auth.unknown.key
```

## 🎨 Integrazione con UI

### DaisyUI Theming + i18n
```typescript
const { t, i18n } = useTranslation()

// Applica direzione testo (RTL/LTR)
document.dir = i18n.dir()  // 'ltr' o 'rtl'

return (
  <div data-theme="light">
    <h1>{t('welcome')}</h1>
  </div>
)
```

### Date/Time Localization
```typescript
import { format } from 'date-fns'
import { it, enUS, es, fr, de } from 'date-fns/locale'

const locales = { it, en: enUS, es, fr, de }
const locale = locales[i18n.language] || enUS

format(new Date(), 'PPP', { locale })
```

### Number Formatting
```typescript
const num = 1234.56

// Inglese: 1,234.56
new Intl.NumberFormat('en-US').format(num)

// Italiano: 1.234,56
new Intl.NumberFormat('it-IT').format(num)
```

## 📚 Risorse

- **react-i18next**: https://react.i18next.com/
- **i18next**: https://www.i18next.com/
- **Esempi**: https://github.com/i18next/react-i18next/tree/master/example

## 🎯 Checklist Implementazione

- [x] Installare pacchetti i18next
- [x] Configurare i18n.ts
- [x] Creare file traduzione (5 lingue)
- [x] Creare LanguageSelector component
- [x] Aggiornare LoginComponent con traduzioni
- [x] Testare auto-rilevamento lingua
- [x] Testare cambio lingua manuale
- [x] Verificare persistenza localStorage
- [ ] Aggiungere test automatici
- [ ] Documentare nuove chiavi di traduzione

## 🚀 Quick Start

### Per Sviluppatori

1. **Usa le traduzioni**:
```typescript
import { useTranslation } from 'react-i18next'

const { t } = useTranslation()
return <h1>{t('auth.login.title')}</h1>
```

2. **Cambia lingua**:
```typescript
const { i18n } = useTranslation()
i18n.changeLanguage('it')
```

3. **Aggiungi nuove chiavi**:
Modifica `locales/*/translation.json` per tutte le lingue.

### Per Traduttori

1. Apri `locales/[lingua]/translation.json`
2. Traduci i valori (non le chiavi!)
3. Mantieni la struttura JSON
4. Testa nel browser

---

**Lingue Supportate**: 🇬🇧 🇮🇹 🇪🇸 🇫🇷 🇩🇪
