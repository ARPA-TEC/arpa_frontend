import { useState } from 'react'


function Login_estudiante() {
  const [nombre, setNombre] = useState('')

  return (
    <div>
        <h1> Nombre del estudiante</h1>
        <input
        id="campo_nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Escribe tu nombre"
      />
        <button
          className="counter"
          onClick={() => navegarA('vista')}
        >
          Entrar
        </button>
    </div>
  )
}

export default Login_estudiante