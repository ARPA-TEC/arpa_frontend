import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './BarraSuperior.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function BarraSuperior() {
 
  return (
    <div>
        <div id="arpa_icono">
            <img src="./assets/arpaOscura"></img>
        </div>
    </div>
  )
}

export default Login_estudiante