import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import arpaLogo from "./assets/arpa_con_fondo.png";
import exclamationIcon from "./assets/exclamationIcon.png";
import './DashboardTutor.css'

// --- Mock Data ---
const TUTOR = { name: 'Sebastian', horasCompletadas: 90, horasTotal: 120 }

const SKILL_COLORS = ['red', 'green', 'amber', 'gray']

const ESTUDIANTES = [
  {
    id: 1,
    nombre: 'Oriana Cañizales',
    nivel: 'B2',
    skills: [
      { nombre: 'Reading',   score: 98 },
      { nombre: 'Writing',   score: 85 },
      { nombre: 'Listening', score: 91 },
      { nombre: 'Speaking',  score: 78 },
    ],
    unidades: [
      { id: 1, tema: 'Grammar', estado: 'Completado'  },
      { id: 2, tema: 'Grammar', estado: 'En progreso' },
      { id: 3, tema: 'Grammar', estado: 'Not started' },
    ],
  },
  {
    id: 2,
    nombre: 'Santiago Rodriguez',
    nivel: 'C1',
    skills: [
      { nombre: 'Reading',   score: 95 },
      { nombre: 'Writing',   score: 88 },
      { nombre: 'Listening', score: 76 },
      { nombre: 'Speaking',  score: 82 },
    ],
    unidades: [
      { id: 1, tema: 'Vocabulary',    estado: 'Completado'  },
      { id: 2, tema: 'Pronunciation', estado: 'En progreso' },
    ],
  },
]

const BITACORAS = [
  {
    id: 1,
    estudiante: 'Santiago Rodriguez',
    fecha: '10/04/2026',
    horaInicio: '10:30',
    horaFin: '12:00',
    duracion: '1.5 hr',
    notas:
      'Se trabajó comprensión auditiva con material audiovisual. El estudiante mostró mejora notable en la identificación de phrasal verbs en contexto.',
  },
  {
    id: 2,
    estudiante: 'Oriana Cañizales',
    fecha: '08/04/2026',
    horaInicio: '09:00',
    horaFin: '10:30',
    duracion: '1.5 hr',
    notas:
      'Revisión de gramática avanzada. Se practicaron estructuras condicionales tipo 2 y 3 con ejercicios escritos.',
  },
]

const INCIDENCIAS = [
  {
    id: 1,
    estudiante: 'Oriana Cañizales',
    fecha: '05/04/2026',
    tipo: 'Inasistencia',
    descripcion: 'La estudiante no se presentó a la sesión sin previo aviso.',
    estado: 'Pendiente',
  },
]

// -------------------------------------------------

// function EstadoBadge({ estado }) {
//   const cls =
//     estado === 'Completado'
//       ? 'badge-completado'
//       : estado === 'En progreso'
//       ? 'badge-progreso'
//       : 'badge-notstarted'
//   return <span className={`estado-badge ${cls}`}>{estado}</span>
// }

function EstudianteCard({ estudiante }) {
  return (
    <div className="card">
      <div className="estudiante-header">
        <div className="estudiante-titulo">
          <h2>{estudiante.nombre}</h2>
          <span className="nivel-badge">{estudiante.nivel}</span>
        </div>
        <button className="btn-editar">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Editar
        </button>
      </div>

      <div className="skills-row">
        {estudiante.skills.map((s, i) => (
          <div key={i} className={`skill-pill skill-${SKILL_COLORS[i % SKILL_COLORS.length]}`}>
            <span className="skill-name">{s.nombre}</span>
            <span className="skill-score">{s.score}</span>
          </div>
        ))}
      </div>

      {/* <div className="unidades-tabla">
        <div className="tabla-header">
          <span>Unidad</span>
          <span>Nombre de tema</span>
          <span>Estado</span>
        </div>
        {estudiante.unidades.map((u) => (
          <div key={u.id} className="tabla-fila">
            <span>Unidad {u.id}</span>
            <span>{u.tema}</span>
            <EstadoBadge estado={u.estado} />
          </div>
        ))}
      </div>

      <div className="unidades-footer">
        <button className="btn-link">+ Añadir unidad</button>
        <div className="nav-arrows">
          <button className="arrow-btn">‹</button>
          <button className="arrow-btn">›</button>
        </div>
      </div> */}
      
    </div>
  )
}
function BitacoraCard({ b }) {
  return (
    <div className="card">
      <div className="bitacora-top">
        <div>
          <h3>{b.estudiante}</h3>
          <div className="bitacora-meta">
            <span className="meta-chip">{b.fecha}</span>
            <span className="meta-chip">{b.horaInicio} - {b.horaFin}</span>
          </div>
        </div>
        <div className="duracion-box">{b.duracion}</div>
      </div>
      <p className="bitacora-notas">{b.notas}</p>
    </div>
  )
}

function IncidenciaCard({ inc }) {
  return (
    <div className="card">
      <div className="incidencia-top">
        <div>
          <h3>{inc.estudiante}</h3>
          <div className="bitacora-meta">
            <span className="meta-chip">{inc.fecha}</span>
            <span className="meta-chip tipo-chip">{inc.tipo}</span>
          </div>
        </div>
            <img src={exclamationIcon} alt="exclamation icon" className="admin-logo"></img>
        {/* <EstadoBadge estado={inc.estado === 'Pendiente' ? 'En progreso' : 'Completado'} /> */}
      </div>
      <p className="bitacora-notas">{inc.descripcion}</p>
    </div>
  )
}

export default function DashboardTutor() {
  const navigate = useNavigate()
  const [tab, setTab]         = useState('estudiantes')
  const [busqueda, setBusqueda] = useState('')

  const pct           = (TUTOR.horasCompletadas / TUTOR.horasTotal) * 100
  const horasFaltantes = TUTOR.horasTotal - TUTOR.horasCompletadas

  const estudiantesFiltrados = ESTUDIANTES.filter((e) =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )
  const bitacorasFiltradas = BITACORAS.filter((b) =>
    b.estudiante.toLowerCase().includes(busqueda.toLowerCase())
  )

  const TABS = ['estudiantes', 'bitacoras', 'incidencias']
  const TAB_LABELS = { estudiantes: 'Estudiantes', bitacoras: 'Bitácoras', incidencias: 'Incidencias' }

  return (
    <div className="dashboard-root">

      <header className="dashboard-nav">
        <div className="nav-brand">
          <div className="brand-icon">
            <img src={arpaLogo} alt="ARPA logo" className="admin-logo" />
          </div>
          <div className="brand-text">
            <span className="brand-name">ARPA</span>
            <span className="brand-sub">Portal de tutor</span>
          </div>
        </div>

        <div className="nav-right">
          <span className="nav-welcome">Bienvenido, {TUTOR.name}</span>
          <button className="logout-btn" title="Cerrar sesión" onClick={() => navigate('/')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      <div className="progress-card">
        <div className="progress-header">
          <div>
            <p className="progress-title">Progreso de horas</p>
            <p className="progress-sub">{TUTOR.horasCompletadas} de {TUTOR.horasTotal} hrs completadas</p>
          </div>
          <span className="horas-faltantes">{horasFaltantes} horas faltantes</span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <nav className="tabs-row">
        {TABS.map((t) => (
          <button
            key={t}
            className={`tab-btn ${tab === t ? 'tab-active' : ''}`}
            onClick={() => { setTab(t); setBusqueda('') }}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </nav>

      <div className="search-bar-row">
        <input
          className="search-input"
          placeholder={tab === 'bitacoras' ? 'Filtrar estudiantes' : 'Seleccionar estudiante'}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        {tab === 'bitacoras' && (
          <button className="btn-añadir">Añadir bitácora</button>
        )}
      </div>

      <main className="content-area">
        {tab === 'estudiantes' &&
          estudiantesFiltrados.map((e) => <EstudianteCard key={e.id} estudiante={e} />)}

        {tab === 'bitacoras' &&
          bitacorasFiltradas.map((b) => <BitacoraCard key={b.id} b={b} />)}

        {tab === 'incidencias' &&
          INCIDENCIAS.map((inc) => <IncidenciaCard key={inc.id} inc={inc} />)}
      </main>
    </div>
  )
}