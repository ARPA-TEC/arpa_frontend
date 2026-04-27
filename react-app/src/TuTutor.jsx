import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import iconoPerfil from "./assets/perfil.png"
import iconoCorreo from "./assets/correo.png"
import "./TuTutor.css"

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function TuTutor() {

    return (
        <div>
            <h2>Tu tutor</h2>
            <div id="body">
                <div id="foto_perfil">
                    <img src={iconoPerfil} ></img>
                </div>
                <div id="info_perfil">
                    <h2> Sebastian Ponce Vaquero </h2>
                    <div id="correo">
                        <img src={iconoCorreo} ></img>
                        <p> A01738027@tec.mx </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TuTutor