import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Login_estudiante from './Login_estudiante'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Login_estudiante />
  </StrictMode>,
)
