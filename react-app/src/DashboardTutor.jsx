import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import arpaLogo from "./assets/arpa_con_fondo.png"
import exclamationIcon from "./assets/exclamationIcon.png"
import './DashboardTutor.css'

const token = () => localStorage.getItem('token')

async function apiFetch(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}`, ...options.headers },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Error de servidor')
  return data
}

function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.readAsDataURL(file)
  })
}

function calcDuracion(inicio, fin) {
  const [sh, sm] = inicio.split(':').map(Number)
  const [eh, em] = fin.split(':').map(Number)
  return Math.round(((eh * 60 + em) - (sh * 60 + sm)) / 60 * 10) / 10
}

const SKILL_COLORS = ['red', 'green', 'amber', 'gray']
const SKILL_API_KEYS = {
  Reading: 'comprension_lectora', Speaking: 'expresion_oral',
  Listening: 'comprension_auditiva', Writing: 'expresion_escrita',
}
// Habilidades base: garantiza que todo estudiante muestre las 4 aunque el API no las mande
const DEFAULT_SKILLS = { Reading: 0, Speaking: 0, Listening: 0, Writing: 0 }

const normalizeStudent = (s) => ({ ...s, skills: { ...DEFAULT_SKILLS, ...s.skills } })

const TABS = ['estudiantes', 'bitacoras', 'incidencias']
const TAB_LABELS = { estudiantes: 'Estudiantes', bitacoras: 'Bitácoras', incidencias: 'Incidencias' }

function UploadZone({ preview, onChange }) {
  const ref = useRef()

  const handleDrop = async (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) onChange(file)
  }

  return (
    <div
      onClick={() => ref.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      style={{
        border: '2px dashed #3a3a3a', borderRadius: 10, padding: 16, cursor: 'pointer',
        minHeight: 90, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'border-color 0.2s', background: 'var(--color-surface-alt)',
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-aqua-light)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#3a3a3a'}
    >
      {preview
        ? <img src={preview} alt="evidencia" style={{ maxWidth: '100%', maxHeight: 160, borderRadius: 8, objectFit: 'contain' }} />
        : (
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              style={{ opacity: 0.4, display: 'block', margin: '0 auto 6px' }}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span style={{ fontSize: 'var(--font-xs)' }}>Arrastra o haz clic para subir imagen</span><br />
            <span style={{ fontSize: 13, opacity: 0.6 }}>PNG o JPG</span>
          </div>
        )
      }
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={(e) => { if (e.target.files[0]) onChange(e.target.files[0]) }} />
    </div>
  )
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function EstudianteCard({ estudiante, onEditar }) {
  return (
    <div className="card" data-testid="estudiante-card">
      <div className="estudiante-header">
        <div className="estudiante-titulo">
          <h2>{estudiante.name}</h2>
          <span className="nivel-badge">{estudiante.level}</span>
        </div>
        <button className="btn-editar" onClick={() => onEditar(estudiante)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Editar
        </button>
      </div>
      <div className="skills-row">
        {Object.entries(estudiante.skills).map(([nombre, score], i) => (
          <div key={nombre} className={`skill-pill skill-${SKILL_COLORS[i % SKILL_COLORS.length]}`}>
            <span className="skill-name">{nombre}</span>
            <span className="skill-score">{score}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BitacoraCard({ b }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="card" data-testid="bitacora-card" style={{ cursor: 'pointer' }} onClick={() => setOpen((v) => !v)}>
      <div className="bitacora-top">
        <div style={{ flex: 1 }}>
          <h3>{b.estudiante}</h3>
          <div className="bitacora-meta">
            <span className="meta-chip">{b.fecha}</span>
            <span className="meta-chip">{b.duracion_horas} hr</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="duracion-box">{b.duracion_horas} hr</div>
          <span style={{ color: 'var(--color-text-muted)' }}><ChevronIcon open={open} /></span>
        </div>
      </div>

      <p className="bitacora-notas" style={{
        overflow: 'hidden', textOverflow: 'ellipsis',
        whiteSpace: open ? 'normal' : 'nowrap',
        opacity: 0.7, marginTop: 8,
      }}>
        {b.notas}
      </p>

      {/* Imagen de evidencia, solo visible al expandir */}
      {open && (
        <div style={{ marginTop: 10 }} onClick={(e) => e.stopPropagation()}>
          {b.evidencia_url
            ? (
              <div style={{ marginTop: 14, borderRadius: 9, overflow: 'hidden', border: '1.5px solid #2a2a2a', background: '#111', textAlign: 'center' }}>
                <img src={b.evidencia_url} alt="Evidencia" style={{ width: '100%', height: 'auto', objectFit: 'contain', display: 'block' }} />
              </div>
            )
            : <p style={{ marginTop: 6, fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Sin evidencia adjunta</p>
          }
        </div>
      )}
    </div>
  )
}

function IncidenciaCard({ inc }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="card" style={{ cursor: 'pointer' }} onClick={() => setOpen((v) => !v)}>
      <div className="incidencia-top">
        <div style={{ flex: 1 }}>
          <h3>{inc.estudiante}</h3>
          <div className="bitacora-meta">
            <span className="meta-chip">{inc.fecha}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={exclamationIcon} alt="exclamation icon" className="admin-logo" />
          <span style={{ color: 'var(--color-text-muted)' }}><ChevronIcon open={open} /></span>
        </div>
      </div>

      <p className="bitacora-notas" style={{
        overflow: 'hidden', textOverflow: 'ellipsis',
        whiteSpace: open ? 'normal' : 'nowrap',
        opacity: 0.7, marginTop: 8,
      }}>
        {inc.descripcion}
      </p>

      {/* Imagen de evidencia, solo visible al expandir */}
      {open && (
        <div style={{ marginTop: 10 }} onClick={(e) => e.stopPropagation()}>
          {inc.evidencia_url
            ? (
              <div style={{ marginTop: 14, borderRadius: 9, overflow: 'hidden', border: '1.5px solid #2a2a2a', background: '#111', textAlign: 'center' }}>
                <img src={inc.evidencia_url} alt="Evidencia" style={{ width: '100%', height: 'auto', objectFit: 'contain', display: 'block' }} />
              </div>
            )
            : <p style={{ marginTop: 6, fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Sin evidencia adjunta</p>
          }
        </div>
      )}
    </div>
  )
}

function ModalEditSkill({ estudiante, onConfirm, onClose }) {
  const [scores, setScores] = useState({ ...estudiante.skills })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleConfirm = async () => {
    setLoading(true); setError(null)
    try {
      for (const [label, puntuacion] of Object.entries(scores)) {
        const habilidad = SKILL_API_KEYS[label]
        if (!habilidad) continue
        await apiFetch(`/tutors/me/students/${estudiante.id_estudiante}/skills`, {
          method: 'PUT',
          body: JSON.stringify({ id_estudiante: estudiante.id_estudiante, habilidad, puntuacion }),
        })
      }
      onConfirm(estudiante.id_estudiante, scores)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Editar habilidades — {estudiante.name}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-form">
          {Object.entries(scores).map(([label, val], i) => (
            <div className="form-field" key={label}>
              <label>{label}</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input type="range" min={0} max={120} value={val}
                  onChange={(e) => setScores((s) => ({ ...s, [label]: Number(e.target.value) }))}
                  style={{ flex: 1, accentColor: ['#9E2A2B','#4F772D','#E09F3E','#9ca3af'][i % 4] }} />
                <input type="number" min={0} max={120} value={val}
                  onChange={(e) => setScores((s) => ({ ...s, [label]: Math.min(120, Math.max(0, Number(e.target.value))) }))}
                  style={{ width: 62, background: 'var(--color-surface-alt)', border: '1.5px solid #333',
                    borderRadius: 7, color: 'var(--color-text)', fontSize: 'var(--font-sm)',
                    textAlign: 'center', padding: '6px 4px', fontFamily: 'inherit', outline: 'none' }} />
              </div>
            </div>
          ))}
          {error && <p style={{ color: '#f87171', fontSize: 'var(--font-xs)', background: 'rgba(239,68,68,0.08)', borderRadius: 7, padding: '8px 12px', margin: 0 }}>{error}</p>}
        </div>
        <div className="modal-actions">
          <button className="btn-modal-cancel" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="btn-add-primary" onClick={handleConfirm} disabled={loading}>
            {loading ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ModalAddBitacora({ estudiantes, onConfirm, onClose }) {
  const [form, setForm] = useState({ id_estudiante: '', fecha: '', horaInicio: '', horaFin: '', notas: '' })
  const [evidenciaFile, setEvidenciaFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleFile = async (file) => {
    setEvidenciaFile(file)
    setPreview(await fileToBase64(file))
  }

  const handleConfirm = async () => {
    const { id_estudiante, fecha, horaInicio, horaFin, notas } = form
    if (!id_estudiante || !fecha || !horaInicio || !horaFin || !notas) {
      setError('Todos los campos son obligatorios.'); return
    }
    setLoading(true); setError(null)
    try {
      const duracion_horas = calcDuracion(horaInicio, horaFin)
      const evidencia_url = evidenciaFile ? await fileToBase64(evidenciaFile) : null
      const result = await apiFetch('/tutors/me/bitacoras', {
        method: 'POST',
        body: JSON.stringify({ id_estudiante: Number(id_estudiante), fecha_sesion: fecha, duracion_horas, notas, evidencia_url }),
      })
      onConfirm(result.bitacora, form)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}
        style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden' }}>
        <div className="modal-header" style={{ flexShrink: 0 }}>
          <h2 className="modal-title">Añadir bitácora</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-form" style={{ overflowY: 'auto', flex: 1 }}>
          <div className="form-field">
            <label>Estudiante</label>
            <select value={form.id_estudiante} onChange={(e) => set('id_estudiante', e.target.value)}>
              <option value="">Seleccionar estudiante</option>
              {estudiantes.map((e) => <option key={e.id_estudiante} value={e.id_estudiante}>{e.name}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>Fecha</label>
            <input type="date" value={form.fecha} onChange={(e) => set('fecha', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-field" style={{ margin: 0 }}>
              <label>Hora inicio</label>
              <input type="time" value={form.horaInicio} onChange={(e) => set('horaInicio', e.target.value)} />
            </div>
            <div className="form-field" style={{ margin: 0 }}>
              <label>Hora fin</label>
              <input type="time" value={form.horaFin} onChange={(e) => set('horaFin', e.target.value)} />
            </div>
          </div>
          <div className="form-field">
            <label>Notas</label>
            <textarea rows={3} placeholder="Describe lo que se trabajó..." value={form.notas}
              onChange={(e) => set('notas', e.target.value)}
              style={{ background: 'var(--color-surface-alt)', border: '1.5px solid #333', borderRadius: '7px',
                padding: '8px 12px', color: 'var(--color-text)', fontSize: 'var(--font-sm)',
                fontFamily: 'inherit', resize: 'vertical', width: '100%', outline: 'none' }} />
          </div>
          <div className="form-field">
            <label>Evidencia (captura de pantalla)</label>
            <UploadZone preview={preview} onChange={handleFile} />
          </div>
          {error && <p style={{ color: '#f87171', fontSize: 'var(--font-xs)', background: 'rgba(239,68,68,0.08)', borderRadius: 7, padding: '8px 12px', margin: 0 }}>{error}</p>}
        </div>
        <div className="modal-actions" style={{ flexShrink: 0 }}>
          <button className="btn-modal-cancel" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="btn-add-primary" onClick={handleConfirm} disabled={loading}>
            {loading ? 'Guardando…' : 'Añadir bitácora'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ModalAddIncidencia({ bitacoras, onConfirm, onClose }) {
  const [form, setForm] = useState({ id_bitacora: '', descripcion: '' })
  const [evidenciaFile, setEvidenciaFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleFile = async (file) => {
    setEvidenciaFile(file)
    setPreview(await fileToBase64(file))
  }

  const handleConfirm = async () => {
    if (!form.id_bitacora || !form.descripcion) {
      setError('Selecciona una bitácora y escribe una descripción.'); return
    }
    setLoading(true); setError(null)
    try {
      const evidencia_url = evidenciaFile ? await fileToBase64(evidenciaFile) : null
      const result = await apiFetch('/tutors/me/incidencias', {
        method: 'POST',
        body: JSON.stringify({ id_bitacora: Number(form.id_bitacora), descripcion: form.descripcion, evidencia_url }),
      })
      const bitacoraRef = bitacoras.find((b) => b.id === Number(form.id_bitacora))
      onConfirm(result.incidencia, bitacoraRef)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}
        style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden' }}>
        <div className="modal-header" style={{ flexShrink: 0 }}>
          <h2 className="modal-title">Registrar incidencia</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-form" style={{ overflowY: 'auto', flex: 1 }}>
          <div className="form-field">
            <label>Bitácora relacionada</label>
            <select value={form.id_bitacora} onChange={(e) => set('id_bitacora', e.target.value)}>
              <option value="">Seleccionar bitácora</option>
              {bitacoras.map((b) => <option key={b.id} value={b.id}>{b.estudiante} — {b.fecha}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>Descripción</label>
            <textarea rows={3} placeholder="Describe la incidencia..." value={form.descripcion}
              onChange={(e) => set('descripcion', e.target.value)}
              style={{ background: 'var(--color-surface-alt)', border: '1.5px solid #333', borderRadius: '7px',
                padding: '8px 12px', color: 'var(--color-text)', fontSize: 'var(--font-sm)',
                fontFamily: 'inherit', resize: 'vertical', width: '100%', outline: 'none' }} />
          </div>
          <div className="form-field">
            <label>Evidencia (captura de pantalla)</label>
            <UploadZone preview={preview} onChange={handleFile} />
          </div>
          {error && <p style={{ color: '#f87171', fontSize: 'var(--font-xs)', background: 'rgba(239,68,68,0.08)', borderRadius: 7, padding: '8px 12px', margin: 0 }}>{error}</p>}
        </div>
        <div className="modal-actions" style={{ flexShrink: 0 }}>
          <button className="btn-modal-cancel" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="btn-add-primary" onClick={handleConfirm} disabled={loading}>
            {loading ? 'Guardando…' : 'Registrar incidencia'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DashboardTutor() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('estudiantes')
  const [busqueda, setBusqueda] = useState('')
  const [tutor, setTutor] = useState(null)
  const [estudiantes, setEstudiantes] = useState([])
  const [bitacoras, setBitacoras] = useState([])
  const [incidencias, setIncidencias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState(null)
  const [modalBitacora, setModalBitacora] = useState(false)
  const [modalIncidencia, setModalIncidencia] = useState(false)
  const [modalSkill, setModalSkill] = useState(null)

  useEffect(() => {
    apiFetch('/tutors/me')
      .then((data) => {
        setTutor(data.tutor)
        setEstudiantes(data.students.map(normalizeStudent))
        setBitacoras(data.bitacoras)
        setIncidencias(data.incidencias)
      })
      .catch((e) => setErrorCarga(e.message))
      .finally(() => setCargando(false))
  }, [])

  const handleSkillConfirm = (id_estudiante, newScores) => {
    setEstudiantes((prev) => prev.map((e) => e.id_estudiante === id_estudiante ? { ...e, skills: newScores } : e))
    setModalSkill(null)
  }

  const handleBitacoraConfirm = (bitacora, form) => {
    const est = estudiantes.find((e) => e.id_estudiante === Number(form.id_estudiante))
    setBitacoras((prev) => [{
      id: bitacora.id,
      estudiante: est?.name ?? '—',
      fecha: new Date(bitacora.fecha_sesion).toLocaleDateString('es-MX'),
      duracion_horas: bitacora.duracion_horas,
      notas: bitacora.notas,
      evidencia_url: bitacora.evidencia_url ?? null,
    }, ...prev])
    setTutor((prev) => prev ? { ...prev, horas_completadas: prev.horas_completadas + bitacora.duracion_horas } : prev)
    setModalBitacora(false)
  }

  const handleIncidenciaConfirm = (incidencia, bitacoraRef) => {
    setIncidencias((prev) => [{
      id: incidencia.id,
      estudiante: bitacoraRef?.estudiante ?? '—',
      fecha: incidencia.fecha_incidente,
      descripcion: incidencia.descripcion,
      evidencia_url: incidencia.evidencia_url ?? null,
    }, ...prev])
    setModalIncidencia(false)
  }

  const estudiantesFiltrados = estudiantes.filter((e) => (e.name ?? '').toLowerCase().includes(busqueda.toLowerCase()))
  const bitacorasFiltradas = bitacoras.filter((b) => (b.estudiante ?? '').toLowerCase().includes(busqueda.toLowerCase()))
  const pct = tutor ? Math.min(100, (tutor.horas_completadas / tutor.horas_total) * 100) : 0
  const horasFaltantes = tutor ? Math.max(0, tutor.horas_total - tutor.horas_completadas) : 0

  if (cargando) return (
    <div className="dashboard-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--color-text-muted)' }}>
      Cargando…
    </div>
  )

  if (errorCarga) return (
    <div className="dashboard-root" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16 }}>
      <p style={{ color: '#f87171' }}>Error: {errorCarga}</p>
      <button className="btn-add-primary" onClick={() => window.location.reload()}>Reintentar</button>
    </div>
  )

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
          <span className="nav-welcome">Bienvenido, {tutor?.name?.split(' ')[0]}</span>
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
            <p className="progress-sub">{tutor?.horas_completadas} de {tutor?.horas_total} hrs completadas</p>
          </div>
          <span className="horas-faltantes">{horasFaltantes} horas faltantes</span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <nav className="tabs-row">
        {TABS.map((t) => (
          <button key={t} data-testid={`tab-${t}`}
            className={`tab-btn ${tab === t ? 'tab-active' : ''}`}
            onClick={() => { setTab(t); setBusqueda('') }}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </nav>

      <div className="search-bar-row">
        <input className="search-input" data-testid="search-input"
          placeholder={tab === 'bitacoras' ? 'Filtrar estudiantes' : 'Seleccionar estudiante'}
          value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        {tab === 'bitacoras' && (
          <button className="btn-añadir" onClick={() => setModalBitacora(true)}>Añadir bitácora</button>
        )}
        {tab === 'incidencias' && (
          <button className="btn-añadir" onClick={() => setModalIncidencia(true)}
            style={{ background: 'rgba(229,57,53,0.15)', color: '#f87171', border: '1.5px solid rgba(229,57,53,0.3)' }}>
            Registrar incidencia
          </button>
        )}
      </div>

      <main className="content-area">
        {tab === 'estudiantes' && estudiantesFiltrados.map((e) => (
          <EstudianteCard key={e.id} estudiante={e} onEditar={setModalSkill} />
        ))}
        {tab === 'bitacoras' && bitacorasFiltradas.map((b) => (
          <BitacoraCard key={b.id} b={b} />
        ))}
        {tab === 'incidencias' && incidencias.map((inc) => (
          <IncidenciaCard key={inc.id} inc={inc} />
        ))}
      </main>

      {modalBitacora && <ModalAddBitacora estudiantes={estudiantes} onConfirm={handleBitacoraConfirm} onClose={() => setModalBitacora(false)} />}
      {modalIncidencia && <ModalAddIncidencia bitacoras={bitacoras} onConfirm={handleIncidenciaConfirm} onClose={() => setModalIncidencia(false)} />}
      {modalSkill && <ModalEditSkill estudiante={modalSkill} onConfirm={handleSkillConfirm} onClose={() => setModalSkill(null)} />}
    </div>
  )
}