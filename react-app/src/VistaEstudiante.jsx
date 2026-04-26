import { useState } from 'react'
import './App.css'
import BarraSuperior from './BarraSuperior'
import TuTutor from './TuTutor'
import TuProgreso from './TuProgreso'

function VistaEstudiante() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BarraSuperior />
      <TuTutor />
      <TuProgreso />
    </>
  )
}

export default VistaEstudiante