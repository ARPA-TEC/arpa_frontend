import { useNavigate } from 'react-router-dom'
import arpaLogo from './assets/arpa_con_fondo.png'
import './Vista_estudiante.css'
import { useState, useEffect } from 'react'

// ─── Icono de pluma (feather / quill) ────────────────────────────────────────
function QuillIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
      <line x1="16" y1="8" x2="2" y2="22" />
      <line x1="17.5" y1="15" x2="9" y2="15" />
    </svg>
  )
}

// ─── Icono logout ─────────────────────────────────────────────────────────────
function LogoutIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

// ─── Avatar de tutor ──────────────────────────────────────────────────────────
function TutorAvatar() {
  return (
    <div className="ve-tutor-avatar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    </div>
  )
}

// ─── Icono email ──────────────────────────────────────────────────────────────
function EmailIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="2,4 12,13 22,4" />
    </svg>
  )
}

// ─── Skill Card ───────────────────────────────────────────────────────────────
function SkillCard({ skill }) {
  return (
    <div className={`ve-skill-card ve-skill-${skill.color}`}>
      <div className="ve-skill-top">
        <div className="ve-skill-left">
          <QuillIcon className="ve-skill-icon" />
          <span className="ve-skill-name">{skill.nombre}</span>
        </div>
        <span className="ve-skill-badge">{skill.nivel}</span>
      </div>
      <div className="ve-skill-bar-track">
        <div
          className="ve-skill-bar-fill"
          style={{ width: `${skill.pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── Vista Estudiante ─────────────────────────────────────────────────────────
export default function Vista_estudiante() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const [datos, setDatos] = useState(null)

  useEffect(() => {
    fetch('/api/students/me', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => r.json())
      .then(data => {
        console.log('Respuesta completa:', data)  // ← agrega esto
        setDatos(data)
      })
  }, [])

  if (!datos) return <div>Cargando…</div>

  const nombre = datos.student.name.split(' ')[0]
  const email = datos.student.email 
  const nivel = datos.progress.level
  const tutor = datos.tutor
  const pct = { A1:4, A2:20, B1:38, B2:55, C1:73, C2:92 }[nivel] ?? 4
  const skills = [
    { key:'reading',   nombre:'Reading',   pct: Math.round((datos.progress.skills.Reading   ?? 0) / 120 * 100), color:'red'   },
    { key:'writing',   nombre:'Writing',   pct: Math.round((datos.progress.skills.Writing   ?? 0) / 120 * 100), color:'white' },
    { key:'speaking',  nombre:'Speaking',  pct: Math.round((datos.progress.skills.Speaking  ?? 0) / 120 * 100), color:'green' },
    { key:'listening', nombre:'Listening', pct: Math.round((datos.progress.skills.Listening ?? 0) / 120 * 100), color:'amber' },
  ]

  return (
    <div className="ve-root">

      {/* ── Header ── */}
      <header className="ve-header">
        <div className="ve-brand">
          <div className="ve-brand-icon">
            <img src={arpaLogo} alt="Arpa logo" />
          </div>
          <div className="ve-brand-text">
            <span className="ve-brand-name">Arpa</span>
            <span className="ve-brand-sub">Portal de estudiante</span>
          </div>
        </div>

        <div className="ve-header-right">
          <span className="ve-welcome">Bienvenido, {nombre}</span>
          <button
            className="ve-logout-btn"
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            <LogoutIcon />
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="ve-main">

        {/* ── Tu tutor ── */}
        <section className="ve-section-card">
          <h2 className="ve-section-title">Tu tutor</h2>
          <div className="ve-tutor-inner">
            <TutorAvatar />
            <div className="ve-tutor-info">
              <span className="ve-tutor-name">{tutor.name}</span>
              <span className="ve-tutor-email">
                <EmailIcon />
                {tutor.email}
              </span>
            </div>
          </div>
        </section>

        {/* ── Tu progreso ── */}
        <section className="ve-section-card">
          <h2 className="ve-section-title">Tu progreso</h2>

          {/* CEFR bar */}
          <div className="ve-cefr-wrap">
            <div className="ve-cefr-bar-track">
              <div
                className="ve-cefr-bar-fill"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="ve-cefr-labels">
              {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((label) => (
                <span
                  key={label}
                  className={`ve-cefr-label${label === nivel ? '' : ' muted'}`}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="ve-skills-grid">
            {skills.map((skill) => (
              <SkillCard key={skill.key} skill={skill} />
            ))}
          </div>
        </section>

      </main>
    </div>
  )
}