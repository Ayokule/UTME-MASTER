import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/globals.css'
import { applyTheme } from './store/theme'

// Apply saved theme before first render to avoid flash
const saved = localStorage.getItem('utme-theme')
try {
  const parsed = saved ? JSON.parse(saved) : null
  applyTheme(parsed?.state?.theme === 'dark' ? 'dark' : 'light')
} catch {
  applyTheme('light')
}

console.log('🚀 UTME Master is loading...')

try {
  const root = ReactDOM.createRoot(document.getElementById('root')!)
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
  
  console.log('✅ UTME Master loaded successfully')
} catch (error) {
  console.error('❌ Error loading UTME Master:', error)
  
  // Fallback: show error message
  document.body.innerHTML = `
    <div style="
      min-height: 100vh; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: 'Inter', system-ui, sans-serif;
      margin: 0;
      padding: 20px;
    ">
      <div style="
        background: white; 
        padding: 2rem; 
        border-radius: 1rem; 
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); 
        max-width: 500px; 
        text-align: center;
      ">
        <div style="
          width: 64px; 
          height: 64px; 
          background: linear-gradient(135deg, #667eea, #764ba2); 
          border-radius: 1rem; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          margin: 0 auto 1rem;
        ">
          <span style="color: white; font-size: 24px;">⚠️</span>
        </div>
        <h2 style="color: #1f2937; margin-bottom: 1rem; font-size: 1.5rem; font-weight: 700;">
          UTME Master Loading Error
        </h2>
        <p style="color: #6b7280; margin-bottom: 1rem;">
          <strong>Error:</strong> ${error}
        </p>
        <p style="color: #6b7280; margin-bottom: 1rem;">
          Please check the browser console for more details.
        </p>
        <a 
          href="http://localhost:3000/health" 
          target="_blank" 
          style="
            display: inline-block; 
            background: linear-gradient(135deg, #667eea, #764ba2); 
            color: white; 
            padding: 0.75rem 1.5rem; 
            border-radius: 0.5rem; 
            text-decoration: none; 
            font-weight: 600;
            transition: transform 0.2s;
          "
          onmouseover="this.style.transform='scale(1.05)'"
          onmouseout="this.style.transform='scale(1)'"
        >
          Check Backend Status
        </a>
      </div>
    </div>
  `
}
