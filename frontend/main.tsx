import React from 'react'
import ReactDOM from 'react-dom/client'
import LoginComponent from './components/login-component'
import './index.css'
import './i18n' // Inizializza i18n

// Abilita MSW in sviluppo
async function enableMocking() {
  if (import.meta.env.MODE !== 'development') {
    return
  }

  const { startMSW } = await import('./mocks/browser')

  return startMSW()
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <LoginComponent />
    </React.StrictMode>,
  )
})
