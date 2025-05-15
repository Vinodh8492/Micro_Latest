import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { TopbarProvider } from './pages/TopbarContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TopbarProvider>
  <App />
</TopbarProvider>
  </StrictMode>,
)