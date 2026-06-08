import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import arpaLogo from "./assets/arpa_con_fondo.png";
import './Login.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function Login_estudiante() {
  const [studentLoginId, setStudentLoginId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const loginId = studentLoginId.trim().toLowerCase();
    if (!loginId) {
      setError('Por favor ingresa tu ID de estudiante.')
      return
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login/alumno`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_login_id: loginId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Alumno no encontrado. Verifica tu ID.')
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/dashboard/estudiante')

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
              <img src={arpaLogo} alt="ARPA logo" className="admin-logo" />
          </div>
          <span className="lf-brand-name">ARPA</span>
        </div>

        {/* Título */}
        <h1 className="lf-heading">Bienvenido</h1>
        <p className="lf-sub">Ingresa tu ID de estudiante para continuar</p>

        <form onSubmit={handleSubmit}>

        {/* Campo ID */}
        <div className="lf-field">
          <label className="lf-label" htmlFor="campo_student_login_id">ID de estudiante</label>
          <div className="lf-input-wrap">
            <input
              id="campo_student_login_id"
              className="lf-input"
              value={studentLoginId}
              onChange={(e) => setStudentLoginId(e.target.value)}
              placeholder="Escribe tu ID de estudiante"
              autoComplete="username"
            />
          </div>
        </div>

        {error && <p style={{ color: 'red', fontSize: '13px' }}>{error}</p>}

        {/* Botón */}
          <button
            type="submit"              
            className="lf-btn"
            disabled={!studentLoginId.trim() || loading}
            >
              {loading ? 'Buscando...' : 'Entrar'}
          </button>
        </form>

      </div>
    </div>
  )
}

export default Login_estudiante
