import React from 'react'
import ReactDOM from 'react-dom/client'
import LoginComponent from './components/login-component-refactored'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LoginComponent />
  </React.StrictMode>,
)
