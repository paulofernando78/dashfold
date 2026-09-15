import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Supports weights 100-900
import '@fontsource-variable/montserrat/wght.css';
// Supports weights 200-700
import '@fontsource-variable/oswald/wght.css';
import '@fontsource/indie-flower';
// Supports weights 100-800
import '@fontsource-variable/jetbrains-mono/wght.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
