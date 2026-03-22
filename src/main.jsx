// StrictMode — React қосымшасындағы мүмкін проблемаларды анықтау режимі
import { StrictMode } from 'react'
// createRoot — React 18 DOM рендерінің негізгі функциясы
import { createRoot } from 'react-dom/client'
// index.css — жаһандық CSS стильдері
import './index.css'
// i18n.js — i18next аударма жүйесін инициализациялайды
import './i18n/i18n.js'
// App — қосымшаның тамырлық компоненті
import App from './App.jsx'

// DOM-дағы root элементіне React қосымшасын монтаждау
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
