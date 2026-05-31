import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import arpaLogo from "./assets/arpa_con_fondo.png";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import "./DashboardAdmin.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const BAR_COLORS = ["#7c3131", "#0f6e56", "#b07c17", "#534AB7", "#3a3a3a"];

function skillColorClass(score) {
  if (score >= 90) return "skill-green";
  if (score >= 75) return "skill-amber";
  return "skill-red";
}

// ─── Modal base ───────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// ─── Modal añadir estudiante ──────────────────────────────────────────────────
function ModalAddStudent({ tutors, onConfirm, onClose }) {
  const [form, setForm] = useState({ nombre: "", apellido: "", level: "", id_tutor: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const NIVEL_MAP = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };

  const handleConfirm = async () => {
    
    if (!form.nombre || !form.apellido || !form.level || !form.id_tutor) return;
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3000/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: form.nombre,
          apellido: form.apellido,
          id_tutor: Number(form.id_tutor),
          id_nivel: NIVEL_MAP[form.level],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Error al crear estudiante.");
        return;
      }

      onConfirm({
        id: data.student.id,
        name: `${data.student.nombre} ${data.student.apellido}`,
        level: form.level,
        tutor: tutors.find(t => t.id === Number(form.id_tutor))?.name || "",
        skills: {},
      });
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Añadir estudiante" onClose={onClose}>
      <div className="modal-form">
        <div className="form-field">
          <label>Nombre</label>
          <input type="text" placeholder="Nombre" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
        </div>
        <div className="form-field">
          <label>Apellido</label>
          <input type="text" placeholder="Apellido" value={form.apellido} onChange={(e) => set("apellido", e.target.value)} />
        </div>
        <div className="form-field">
          <label>Nivel MCER</label>
          <select value={form.level} onChange={(e) => set("level", e.target.value)}>
            <option value="">Seleccionar nivel</option>
            {["A1","A2","B1","B2","C1","C2"].map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label>Tutor asignado</label>
          <select value={form.id_tutor} onChange={(e) => set("id_tutor", e.target.value)}>
            <option value="">Seleccionar tutor</option>
            {tutors.map((t) => <option key={t.id} value={t.id_tutor}>{t.name}</option>)}
          </select>
        </div>
        {error && <p style={{ color: "red", fontSize: "13px" }}>{error}</p>}
      </div>
      <div className="modal-actions">
        <button className="btn-modal-cancel" onClick={onClose}>Cancelar</button>
        <button className="btn-add-primary" onClick={handleConfirm} disabled={loading}>
          {loading ? "Guardando..." : "Añadir estudiante"}
        </button>
      </div>
    </Modal>
  );
}

// ─── Modal añadir tutor ───────────────────────────────────────────────────────
function ModalAddTutor({ onConfirm, onClose }) {
  const [form, setForm] = useState({ nombre: "", apellido: "", email: "", password: "", matricula: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleConfirm = async () => {
    if (!form.nombre || !form.apellido || !form.email || !form.password || !form.matricula) return;
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3000/api/users/tutores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          password: form.password,
          matricula: form.matricula || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Error al crear tutor.");
        return;
      }

      onConfirm({
        id: data.user.id,
        id_tutor: data.user.id_tutor,
        name: `${data.user.nombre} ${data.user.apellido}`,
        email: data.user.email,
        matricula: data.user.matricula,
        hrs: 0,
        logs: [],
      });
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Añadir tutor" onClose={onClose}>
      <div className="modal-form">
        <div className="form-field">
          <label>Nombre</label>
          <input type="text" placeholder="Nombre" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
        </div>
        <div className="form-field">
          <label>Apellido</label>
          <input type="text" placeholder="Apellido" value={form.apellido} onChange={(e) => set("apellido", e.target.value)} />
        </div>
        <div className="form-field">
          <label>Matrícula</label>
          <input type="text" placeholder="A01738027" value={form.matricula} onChange={(e) => set("matricula", e.target.value)} />
        </div>
        <div className="form-field">
          <label>Correo electrónico</label>
          <input type="email" placeholder="nombre@correo.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div className="form-field">
          <label>Contraseña</label>
          <input type="password" placeholder="Contraseña" value={form.password} onChange={(e) => set("password", e.target.value)} />
        </div>
        {error && <p style={{ color: "red", fontSize: "13px" }}>{error}</p>}
      </div>
      <div className="modal-actions">
        <button className="btn-modal-cancel" onClick={onClose}>Cancelar</button>
        <button className="btn-add-primary" onClick={handleConfirm} disabled={loading}>
          {loading ? "Guardando..." : "Añadir tutor"}
        </button>
      </div>
    </Modal>
  );
}

// ─── StudentCard ──────────────────────────────────────────────────────────────
function StudentCard({ student }) {
  return (
    <div className="card">
      <div className="card-top-row">
        <div className="card-name-group">
          <h2 className="card-student-name">{student.name}</h2>
          <span className="level-badge">{student.level}</span>
        </div>
        <span className="tutor-tag">Tutor: {student.tutor}</span>
      </div>
      <div className="skills-row">
        {Object.entries(student.skills).map(([skill, score]) => (
          <div key={skill} className={`skill-pill ${skillColorClass(score)}`}>
            <span className="skill-name">{skill}</span>
            <span className="skill-score">{score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TutorCard ────────────────────────────────────────────────────────────────
function TutorCard({ tutor, onAddLog }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ fecha: "", horas: "", motivo: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async () => {
    const { fecha, horas, motivo } = form;
    if (!fecha || !horas || !motivo) return;

    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:3000/api/tutors/${tutor.id_tutor}/horas-extras`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fecha,
          horas: Number(horas),
          motivo,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Error al agregar horas.");
        return;
      }

      onAddLog(tutor.id, { fecha, horas: Number(horas), motivo });
      setForm({ fecha: "", horas: "", motivo: "" });
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card tutor-card">
      <div className="tutor-header" onClick={() => setOpen((o) => !o)}>
        <div className="tutor-header-left">
          <h2 className="tutor-name">{tutor.name}</h2>
          <span className="matricula-badge">{tutor.matricula}</span>
        </div>
        <div className="tutor-header-right">
          <span className="hrs-badge">{tutor.hrs} hrs</span>
          <button
            className="expand-toggle"
            onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
          >
            {open ? "−" : "+"}
          </button>
        </div>
      </div>

      {open && (
        <div className="tutor-expand">
          <p className="expand-label">Añadir horas extras</p>
          <div className="add-hours-form">
            <div className="form-field">
              <label>Fecha</label>
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Horas extras</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                placeholder="2.5"
                value={form.horas}
                onChange={(e) => setForm({ ...form, horas: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Motivo</label>
              <input
                type="text"
                placeholder="Describe el motivo"
                value={form.motivo}
                onChange={(e) => setForm({ ...form, motivo: e.target.value })}
              />
            </div>
            {error && <p style={{ color: "red", fontSize: "13px" }}>{error}</p>}
            <button className="btn-add-hours" onClick={handleAdd} disabled={loading}>
              {loading ? "Guardando..." : "Añadir horas"}
            </button>
          </div>

          <div className="logs-list">
            {tutor.logs.map((log, i) => (
              <div key={i} className="log-entry">
                <div className="log-info">
                  <h3 className="log-ref">{log.ref ?? log.motivo}</h3>
                  <p className="log-meta">
                    {log.date ?? log.fecha ?? ''}
                  </p>
                </div>
                <span className="log-hrs-badge">{log.duration ?? log.horas}hr</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DashboardAdmin ───────────────────────────────────────────────────────────
export default function DashboardAdmin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("estudiantes");
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const adminName = storedUser?.nombre || "Administrador";

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch("http://localhost:3000/api/students", { headers }).then(r => r.json()),
      fetch("http://localhost:3000/api/tutors", { headers }).then(r => r.json()),
    ]).then(([estudiantesData, tutoresData]) => {
      setStudents(estudiantesData.students ?? []);
      setTutors((tutoresData.tutors ?? []).map(t => ({ ...t, logs: t.logs || [] })));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleAddLog = (tutorId, logEntry) => {
    const adminName = JSON.parse(localStorage.getItem("user") || "{}")?.nombre || "Administrador";
    setTutors((prev) =>
      prev.map((t) =>
        t.id === tutorId
          ? { ...t, hrs: Math.round((t.hrs + logEntry.horas) * 10) / 10, logs: [...t.logs, { ...logEntry, agregado_por: adminName }] }
          : t
      )
    );
  };

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredTutors = tutors.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const chartData = {
    labels: filteredTutors.map((t) => t.name),
    datasets: [{
      data: filteredTutors.map((t) => t.hrs),
      backgroundColor: filteredTutors.map((_, i) => BAR_COLORS[i % BAR_COLORS.length]),
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#222" },
        ticks: { color: "#888", font: { size: 13 } },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#ccc", font: { size: 13 } },
      },
    },
  };

  const changeTab = (newTab) => {
    setTab(newTab);
    setSearch("");
  };

  const handleAddStudent = (studentData) => {
    setStudents((prev) => [...prev, studentData]);
    setModal(null);
  };

  const handleAddTutor = (tutorData) => {
    setTutors((prev) => [...prev, tutorData]);
    setModal(null);
  };

  if (loading) return <div className="admin-root" style={{ color: "#fff", padding: "2rem" }}>Cargando...</div>;

  return (
    <div className="admin-root">

      {/* ── Header ── */}
      <header className="admin-header">
        <div className="admin-brand">
          <img src={arpaLogo} alt="ARPA logo" className="admin-logo" />
          <div className="admin-brand-text">
            <span className="admin-brand-name">ARPA</span>
            <span className="admin-brand-sub">Portal de administrador</span>
          </div>
        </div>
        <div className="admin-header-right">
          <span className="admin-welcome">Bienvenido, {adminName.split(" ")[0]}</span>
          <button className="admin-logout-btn" onClick={handleLogout} title="Cerrar sesión">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── Nav ── */}
      <nav className="admin-nav">
        <button
          className={`admin-nav-btn ${tab === "estudiantes" ? "active" : ""}`}
          onClick={() => changeTab("estudiantes")}
        >
          Estudiantes
        </button>
        <button
          className={`admin-nav-btn ${tab === "tutores" ? "active" : ""}`}
          onClick={() => changeTab("tutores")}
        >
          Tutores
        </button>
      </nav>

      {/* ── Main content ── */}
      <main className="admin-content">
        <div className="admin-toolbar">
          <input
            className="admin-search"
            placeholder={tab === "estudiantes" ? "Filtrar estudiantes" : "Filtrar tutores"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn-add-primary" onClick={() => setModal(tab === "estudiantes" ? "estudiante" : "tutor")}>
            {tab === "estudiantes" ? "Añadir estudiante" : "Añadir tutor"}
          </button>
        </div>

        {tab === "estudiantes" && (
          <div className="cards-list">
            {filteredStudents.map((s) => (
              <StudentCard key={s.id} student={s} />
            ))}
          </div>
        )}

        {tab === "tutores" && (
          <>
            <div className="chart-container">
              <Bar data={chartData} options={chartOptions} />
            </div>
            <div className="cards-list">
              {filteredTutors.map((t) => (
                <TutorCard key={t.id} tutor={t} onAddLog={handleAddLog} />
              ))}
            </div>
          </>
        )}
      </main>

      {modal === "estudiante" && (
        <ModalAddStudent
          tutors={tutors}
          onConfirm={handleAddStudent}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "tutor" && (
        <ModalAddTutor
          onConfirm={handleAddTutor}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}