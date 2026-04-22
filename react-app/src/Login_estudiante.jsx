import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function Login_estudiante() {
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!nombre.trim() || !apellido.trim()) {
      setError('Por favor completa todos los campos.')
      return
    }

    setLoading(true);
    try {
    const normalizar = (str) =>
        str
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')

      const primerNombre = normalizar(nombre.trim().split(/\s+/)[0])
      const primerApellido = normalizar(apellido.trim().split(/\s+/)[0])

      let token = null
      let userData = null

      for (let i = 1; i <= 10; i++) {
        const studentLoginId = `${primerNombre}${primerApellido}${i}`

        const res = await fetch(`${API_URL}/api/auth/login/alumno`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ student_login_id: studentLoginId }),
        })

        if (res.ok) {
          const data = await res.json()
          token = data.token
          userData = data.user
          break
        }
      }

      if (!token) {
        setError('Alumno no encontrado. Verifica tu nombre y apellido.')
        return
      }

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      navigate('/vista')

    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="lf-wrap">
      <div className="lf-card">

        {/* Marca */}
        <div className="lf-brand">
          <div className="lf-mark">
            {/* Ícono o inicial */}
            <span style={{ color: '#F1EFE8', fontSize: '14px', fontWeight: 600 }}>A</span>
          </div>
          <span className="lf-brand-name">Arpa</span>
        </div>

        {/* Título */}
        <h1 className="lf-heading">Bienvenido</h1>
        <p className="lf-sub">Ingresa tu nombre para continuar</p>

        <form onSubmit={handleSubmit}>

        {/* Campo nombre */}
        <div className="lf-field">
          <label className="lf-label" htmlFor="campo_nombre">Nombre</label>
          <div className="lf-input-wrap">
            <input
              id="campo_nombre"
              className="lf-input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Escribe tu nombre"
            />
          </div>
        </div>

        {/* Campo apellido */}
        <div className="lf-field">
          <label className="lf-label" htmlFor="campo_apellido">Apellido</label>
          <div className="lf-input-wrap">
            <input
              id="campo_apellido"
              className="lf-input"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              placeholder="Escribe tu apellido"
            />
          </div>
        </div>

        {error && <p style={{ color: 'red', fontSize: '13px' }}>{error}</p>}

        {/* Botón */}
          <button
            type="submit"              
            className="lf-btn"
            disabled={!nombre.trim() || !apellido.trim() || loading}
            >
              {loading ? 'Buscando...' : 'Entrar'}
          </button>
        </form>

      </div>
    </div>
  )
}

export default Login_estudiante