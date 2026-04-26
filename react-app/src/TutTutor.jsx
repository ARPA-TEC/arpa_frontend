import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import arpaOscura from "./assets/arpaOscura.png"
import salida from "./assets/salida.png"

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function TuTutor() {

    return (
        <div>
            <h2>Tu tutor</h2>
            <div id="foto_perfil"> </div>
            <div id="info_perfil">
                <h2> Sebastian Ponce Vaquero </h2>
                <div id="correo">

                </div>
            </div>
        </div>
    )
}

export default TuTutor