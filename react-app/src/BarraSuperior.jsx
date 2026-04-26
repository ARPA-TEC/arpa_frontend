import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import arpaOscura from "./assets/arpaOscura.png"
import salida from "./assets/salida.png"

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function BarraSuperior() {
 
  return (
    <div>
        <div id="esquina_izquierda">
            <div id="arpa_icono">
                <img src= {arpaOscura} ></img>
            </div>
            <div id="info_portal">
                <h3>Arpa</h3>
                <p>Portal de estudiante</p>
            </div>
        </div>

        <div id="esquina_derecha">
            <h1> Bienvendio, Santiago </h1>
            <div id="btn_salida">
                <img src={salida}></img>
            </div>
        </div>
    </div>
  )
}

export default BarraSuperior