import { useState } from "react";
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

// ─── Datos de ejemplo ─────────────────────────────────────────────────────────
// TODO: reemplazar con fetch(`/api/students`) y fetch(`/api/tutors`) en useEffect
const MOCK_STUDENTS = [
  {
    id: 1,
    name: "Oriana Cañizales",
    level: "B2",
    tutor: "Sebastián Ponce",
    skills: { Reading: 99, Speaking: 72, Writing: 88, Listening: 98 },
  },
  {
    id: 2,
    name: "Santiago Rodríguez",
    level: "B2",
    tutor: "Sebastián Ponce",
    skills: { Reading: 98, Speaking: 85, Writing: 91, Listening: 98 },
  },
  {
    id: 3,
    name: "Mariana López",
    level: "A2",
    tutor: "Dariana Vega",
    skills: { Reading: 64, Speaking: 55, Writing: 70, Listening: 60 },
  },
];

const MOCK_TUTORS = [
  {
    id: 1,
    name: "Sebastián Ponce",
    matricula: "A01738027",
    hrs: 90,
    logs: [
      { ref: "Santiago Rodríguez", date: "10/04/2026", start: "10:30", end: "12:00" },
    ],
  },
  { id: 2, name: "Dariana Vega",  matricula: "A01738028", hrs: 120, logs: [] },
  { id: 3, name: "Luis Salinas",  matricula: "A01738029", hrs: 60,  logs: [] },
];

const BAR_COLORS = ["#7c3131", "#0f6e56", "#b07c17", "#534AB7", "#3a3a3a"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcHrs(start, end) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.round(((eh * 60 + em) - (sh * 60 + sm)) / 60 * 10) / 10;
}

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
  const [form, setForm] = useState({ name: "", level: "", tutor: "" });
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleConfirm = () => {
    if (!form.name || !form.level || !form.tutor) return;
    onConfirm(form);
  };

  return (
    <Modal title="Añadir estudiante" onClose={onClose}>
      <div className="modal-form">
        <div className="form-field">
          <label>Nombre</label>
          <input type="text" placeholder="Nombre completo" value={form.name} onChange={(e) => set("name", e.target.value)} />
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
          <select value={form.tutor} onChange={(e) => set("tutor", e.target.value)}>
            <option value="">Seleccionar tutor</option>
            {tutors.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>
        </div>
      </div>
      <div className="modal-actions">
        <button className="btn-modal-cancel" onClick={onClose}>Cancelar</button>
        <button className="btn-add-primary" onClick={handleConfirm}>Añadir estudiante</button>
      </div>
    </Modal>
  );
}

// ─── Modal añadir tutor ───────────────────────────────────────────────────────
function ModalAddTutor({ onConfirm, onClose }) {
  const [form, setForm] = useState({ name: "", matricula: "", level: "", email: "" });
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleConfirm = () => {
    if (!form.name || !form.matricula || !form.level || !form.email) return;
    onConfirm(form);
  };

  return (
    <Modal title="Añadir tutor" onClose={onClose}>
      <div className="modal-form">
        <div className="form-field">
          <label>Nombre</label>
          <input type="text" placeholder="Nombre completo" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div className="form-field">
          <label>Matrícula</label>
          <input type="text" placeholder="A0173XXXX" value={form.matricula} onChange={(e) => set("matricula", e.target.value)} />
        </div>
        <div className="form-field">
          <label>Nivel de idioma</label>
          <select value={form.level} onChange={(e) => set("level", e.target.value)}>
            <option value="">Seleccionar nivel</option>
            {["A1","A2","B1","B2","C1","C2"].map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label>Correo electrónico</label>
          <input type="email" placeholder="nombre@correo.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
      </div>
      <div className="modal-actions">
        <button className="btn-modal-cancel" onClick={onClose}>Cancelar</button>
        <button className="btn-add-primary" onClick={handleConfirm}>Añadir tutor</button>
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
  const [form, setForm] = useState({ ref: "", date: "", start: "", end: "" });

  const handleAdd = () => {
    const { ref, date, start, end } = form;
    if (!ref || !date || !start || !end) return;
    onAddLog(tutor.id, { ref, date, start, end });
    setForm({ ref: "", date: "", start: "", end: "" });
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
          <p className="expand-label">Añadir horas</p>
          <div className="add-hours-form">
            <div className="form-field">
              <label>Nombre de referencia</label>
              <input
                type="text"
                placeholder="Nombre del estudiante"
                value={form.ref}
                onChange={(e) => setForm({ ...form, ref: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Fecha (dd/mm/aaaa)</label>
              <input
                type="text"
                placeholder="10/04/2026"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Horario inicio</label>
              <input
                type="text"
                placeholder="10:30"
                value={form.start}
                onChange={(e) => setForm({ ...form, start: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Horario fin</label>
              <input
                type="text"
                placeholder="12:00"
                value={form.end}
                onChange={(e) => setForm({ ...form, end: e.target.value })}
              />
            </div>
            <button className="btn-add-hours" onClick={handleAdd}>
              Añadir horas
            </button>
          </div>

          <div className="logs-list">
            {tutor.logs.map((log, i) => {
              const hrs = calcHrs(log.start, log.end);
              return (
                <div key={i} className="log-entry">
                  <div className="log-info">
                    <h3 className="log-ref">{log.ref}</h3>
                    <p className="log-meta">{log.date} &nbsp; {log.start} – {log.end}</p>
                  </div>
                  <span className="log-hrs-badge">{hrs}hr</span>
                </div>
              );
            })}
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
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [tutors, setTutors] = useState(MOCK_TUTORS);
  const [modal, setModal] = useState(null); // "estudiante" | "tutor" | null

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const adminName = storedUser?.name || "Administrador";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleAddLog = (tutorId, logEntry) => {
    const hrs = calcHrs(logEntry.start, logEntry.end);
    setTutors((prev) =>
      prev.map((t) =>
        t.id === tutorId
          ? { ...t, hrs: Math.round((t.hrs + hrs) * 10) / 10, logs: [...t.logs, logEntry] }
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

  const handleAddStudent = (form) => {
    setStudents((prev) => [...prev, {
      id: prev.length + 1,
      name: form.name,
      level: form.level,
      tutor: form.tutor,
      skills: { Reading: 0, Speaking: 0, Writing: 0, Listening: 0 },
    }]);
    setModal(null);
  };

  const handleAddTutor = (form) => {
    setTutors((prev) => [...prev, {
      id: prev.length + 1,
      name: form.name,
      matricula: form.matricula,
      hrs: 0,
      logs: [],
    }]);
    setModal(null);
  };

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