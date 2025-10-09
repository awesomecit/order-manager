// MSW Browser Setup
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

/**
 * MSW Worker per il browser
 * Intercetta le richieste HTTP nel browser e le gestisce con i mock handlers
 */
export const worker = setupWorker(...handlers)

// Configurazione avanzata per sviluppo
export function startMSW() {
  return worker.start({
    onUnhandledRequest: 'warn', // Avvisa per richieste non gestite
    serviceWorker: {
      url: '/mockServiceWorker.js' // Service Worker path
    }
  })
}
