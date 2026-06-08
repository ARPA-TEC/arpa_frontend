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
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const token = () => localStorage.getItem("token");

async function apiFetch(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...options.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error de servidor");
  return data;
}

function skillColorClass(score) {
  if (score >= 90) return "skill-green";
  if (score >= 75) return "skill-amber";
  return "skill-red";
}

function statusClass(estado) {
  if (estado === "Aprobado") return "status-pill--approved";
  if (estado === "No aprobado") return "status-pill--rejected";
  return "status-pill--review";
}

function resolveEvidenceSrc(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function ImageModal({ src, alt, onClose }) {
  if (!src) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "min(92vw, 980px)", width: "auto", padding: 0, background: "#0f0f0f" }}
      >
        <div className="modal-header" style={{ padding: "1rem 1.2rem 0.75rem 1.2rem", marginBottom: 0 }}>
          <h2 className="modal-title">Evidencia</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: "0 1.2rem 1.2rem" }}>
          <img
            src={src}
            alt={alt}
            style={{ width: "100%", maxHeight: "80vh", objectFit: "contain", display: "block", borderRadius: 10 }}
          />
        </div>
      </div>
    </div>
  );
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
    
    if (!form.nombre || !form.apellido || !form.level || !form.id_tutor) {
        setError("Todos los campos son obligatorios.");
        return;
      }
      setLoading(true);
      setError("");

    try {
    const data = await apiFetch("/students", {
      method: "POST",
      body: JSON.stringify({
        nombre: form.nombre,
        apellido: form.apellido,
        id_tutor: Number(form.id_tutor),
        id_nivel: NIVEL_MAP[form.level],
      }),
    });

    onConfirm({
      id: data.student.id,
      name: `${data.student.nombre} ${data.student.apellido}`,
      level: form.level,
        tutor: tutors.find(t => t.id === Number(form.id_tutor))?.name || "",
        skills: {},
      });
    } catch (e) {
      setError(e.message || "Error de conexión.");
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
             {tutors.map((t) => <option key={t.id_tutor} value={t.id_tutor}>{t.name}</option>)}
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
function ModalAddTutor({ activeSemester, onConfirm, onClose }) {
  const [form, setForm] = useState({ nombre: "", apellido: "", email: "", password: "", matricula: "", horas_servicio_social: "1" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleConfirm = async () => {
    if (!form.nombre || !form.apellido || !form.email || !form.password || !form.matricula) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch("/users/tutores", {
        method: "POST",
        body: JSON.stringify({
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          password: form.password,
          matricula: form.matricula || null,
          horas_servicio_social: Number(form.horas_servicio_social),
        }),
      });

      onConfirm({
        id: data.user.id,
        id_tutor: data.user.id_tutor,
        name: `${data.user.nombre} ${data.user.apellido}`,
        email: data.user.email,
        matricula: data.user.matricula,
        horas_servicio_social: data.user.horas_servicio_social ?? Number(form.horas_servicio_social),
        hrs: 0,
        logs: [],
        semesters: activeSemester ? [activeSemester] : [],
      });
    } catch (e) {
      setError(e.message || "Error de conexión.");
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
        <div className="form-field">
          <label>Coeficiente de horas</label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            placeholder="1.0"
            value={form.horas_servicio_social}
            onChange={(e) => set("horas_servicio_social", e.target.value)}
          />
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

function ModalAddSemester({ onConfirm, onClose }) {
  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    fecha_inicio: "",
    fecha_fin: "",
    activo: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleConfirm = async () => {
    if (!form.codigo || !form.nombre || !form.fecha_inicio || !form.fecha_fin) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await apiFetch("/semesters", {
        method: "POST",
        body: JSON.stringify({
          codigo: form.codigo,
          nombre: form.nombre,
          fecha_inicio: form.fecha_inicio,
          fecha_fin: form.fecha_fin,
          activo: form.activo,
        }),
      });

      onConfirm(data.semester);
    } catch (e) {
      setError(e.message || "Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Crear semestre" onClose={onClose}>
      <div className="modal-form">
        <div className="form-field">
          <label>Código</label>
          <input type="text" placeholder="2026-3" value={form.codigo} onChange={(e) => set("codigo", e.target.value)} />
        </div>
        <div className="form-field">
          <label>Nombre</label>
          <input type="text" placeholder="Semestre 2026-3" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
        </div>
        <div className="form-field">
          <label>Fecha inicio</label>
          <input type="date" value={form.fecha_inicio} onChange={(e) => set("fecha_inicio", e.target.value)} />
        </div>
        <div className="form-field">
          <label>Fecha fin</label>
          <input type="date" value={form.fecha_fin} onChange={(e) => set("fecha_fin", e.target.value)} />
        </div>
        <div className="form-field semester-active-field">
          <label className="semester-active-label">
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(e) => set("activo", e.target.checked)}
            />
            Marcar como semestre activo
          </label>
        </div>
        {error && <p className="modal-error">{error}</p>}
      </div>
      <div className="modal-actions">
        <button className="btn-modal-cancel" onClick={onClose} disabled={loading}>Cancelar</button>
        <button className="btn-add-primary" onClick={handleConfirm} disabled={loading}>
          {loading ? "Guardando..." : "Crear semestre"}
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
      {student.semester && (
        <div className="student-semester-row">
          <span
            className={`semester-pill ${student.semester.activo ? "semester-pill--active" : "semester-pill--inactive"}`}
          >
            {student.semester.codigo ?? student.semester.nombre}
          </span>
        </div>
      )}
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
function TutorCard({ tutor, availableSemesters, semesterId, onAddLog, onEnrollSemester, onUpdateServiceHours }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ fecha: "", horas: "", motivo: "" });
  const [serviceHours, setServiceHours] = useState(String(tutor.horas_servicio_social ?? 1));
  const [semesterToAdd, setSemesterToAdd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async () => {
    const { fecha, horas, motivo } = form;
    if (!fecha || !horas || !motivo) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiFetch(`/tutors/${tutor.id_tutor}/horas-extras`, {
        method: "POST",
        body: JSON.stringify({
          id_semestre: Number(semesterId),
          fecha,
          horas: Number(horas),
          motivo,
        }),
      });

      const fechaFormateada = new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX');
      onAddLog(tutor.id, { fecha: fechaFormateada, horas: Number(horas), motivo });
      setForm({ fecha: "", horas: "", motivo: "" });
    } catch (e) {
      setError(e.message || "Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!semesterToAdd) return;
    setLoading(true);
    setError("");
    try {
      await onEnrollSemester(tutor.id_tutor, semesterToAdd);
      setSemesterToAdd("");
    } catch (e) {
      setError(e.message || "Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateServiceHours = async () => {
    const parsed = Number(serviceHours);
    if (Number.isNaN(parsed) || parsed <= 0) {
      setError("Las horas de servicio social deben ser un numero mayor a 0.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await apiFetch(`/tutors/${tutor.id_tutor}/horas-servicio-social`, {
        method: "PUT",
        body: JSON.stringify({ horas_servicio_social: parsed }),
      });
      onUpdateServiceHours(tutor.id_tutor, parsed);
    } catch (e) {
      setError(e.message || "Error de conexión.");
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
          <span className="meta-chip">Coef. {tutor.horas_servicio_social ?? 1}</span>
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

      {!!tutor.semesters?.length && (
        <div className="tutor-semester-row">
          {tutor.semesters.map((semester) => (
            <span
              key={semester.id_semestre}
              className={`semester-pill ${semester.activo ? "semester-pill--active" : "semester-pill--inactive"}`}
            >
              {semester.codigo}
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="tutor-expand">
          <p className="expand-label">Actualizar coeficiente de horas de servicio social</p>
          <div className="add-hours-form" style={{ marginBottom: 16 }}>
            <div className="form-field">
              <label>Horas de servicio social</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={serviceHours}
                onChange={(e) => setServiceHours(e.target.value)}
              />
            </div>
            <button className="btn-add-hours" style={{ marginTop: 30 }} onClick={handleUpdateServiceHours} disabled={loading}>
              {loading ? "Guardando..." : "Actualizar coeficiente"}
            </button>
          </div>

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
            <button className="btn-add-hours" style={{ marginTop: 30 }} onClick={handleAdd} disabled={loading}>
              {loading ? "Guardando..." : "Añadir horas"}
            </button>
          </div>

          <div className="add-hours-form" style={{ marginTop: 16 }}>
            <p className="expand-label">Inscribir a otro semestre</p>
            <div className="form-field semester-enroll-row">
              <label>Semestre</label>
              <select className="dashboard-select" value={semesterToAdd} onChange={(e) => setSemesterToAdd(e.target.value)}>
                <option value="">Seleccionar semestre</option>
                {availableSemesters
                  .filter((semester) => !tutor.semesters?.some((item) => item.id_semestre === semester.id_semestre))
                  .map((semester) => (
                    <option key={semester.id_semestre} value={semester.id_semestre}>
                      {semester.nombre}
                    </option>
                  ))}
              </select>
            </div>
            <button className="btn-add-hours" onClick={handleEnroll} disabled={loading || !semesterToAdd}>
              Inscribir tutor
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
                  {log.estado && <span className={`status-pill ${statusClass(log.estado)}`}>{log.estado}</span>}
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
  const [pendingBitacoras, setPendingBitacoras] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [modal, setModal] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const adminName = storedUser?.nombre || "Administrador";
  const activeSemester = semesters.find((semester) => String(semester.id_semestre) === String(selectedSemesterId))
    || semesters.find((semester) => semester.activo)
    || null;

  const loadSemesterData = async (semesterId) => {
    const [studentsData, tutorsData] = await Promise.all([
      apiFetch(`/students?semester_id=${semesterId}`),
      apiFetch(`/tutors?semester_id=${semesterId}`),
    ]);

    setStudents((studentsData.students ?? []).map((student) => ({
      ...student,
      semester: student.semester ?? null,
    })));
    setTutors((tutorsData.tutors ?? []).map((tutor) => ({ ...tutor, logs: tutor.logs || [], semesters: tutor.semesters || [] })));
    const pendingData = await apiFetch(`/bitacoras/pending?semester_id=${semesterId}`);
    setPendingBitacoras(pendingData.bitacoras ?? []);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorCarga("");
      try {
        const semestersData = await apiFetch("/semesters");
        const semesterList = semestersData.semesters ?? [];
        setSemesters(semesterList);
        const storedSemesterId = localStorage.getItem("admin-semester-id");
        const fallbackSemester = semesterList.find((semester) => semester.activo) || semesterList[0] || null;
        const semesterId = storedSemesterId && semesterList.some((semester) => String(semester.id_semestre) === storedSemesterId)
          ? storedSemesterId
          : fallbackSemester ? String(fallbackSemester.id_semestre) : "";

        if (!semesterId) {
          throw new Error("No hay semestres configurados.");
        }

        setSelectedSemesterId(semesterId);
        await loadSemesterData(semesterId);
        localStorage.setItem("admin-semester-id", semesterId);
      } catch (error) {
        setErrorCarga(error.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("admin-semester-id");
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

  const handleUpdateServiceHours = (tutorId, serviceHours) => {
    setTutors((prev) => prev.map((tutor) => (
      tutor.id_tutor === tutorId
        ? { ...tutor, horas_servicio_social: serviceHours }
        : tutor
    )));
  };

  const handleBitacoraUpdate = async (bitacoraId, estado) => {
    await apiFetch(`/bitacoras/${bitacoraId}/estado`, {
      method: "PUT",
      body: JSON.stringify({ estado }),
    });
    setPendingBitacoras((prev) => prev.filter((b) => b.id !== bitacoraId));
    setTutors((prev) => prev.map((tutor) => {
      const updated = pendingBitacoras.find((b) => b.id === bitacoraId);
      if (!updated || tutor.id_tutor !== updated.id_tutor) return tutor;
      const delta = estado === "Aprobado" ? updated.duracion_horas : 0;
      return {
        ...tutor,
        hrs: Math.round((tutor.hrs + delta) * 10) / 10,
        logs: tutor.logs,
      };
    }));
  };

  const handleSemesterChange = async (semesterId) => {
    if (!semesterId || semesterId === selectedSemesterId) return;
    setLoading(true);
    setErrorCarga("");
    try {
      setSelectedSemesterId(String(semesterId));
      await loadSemesterData(semesterId);
      localStorage.setItem("admin-semester-id", String(semesterId));
    } catch (error) {
      setErrorCarga(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollTutorSemester = async (tutorId, semesterId) => {
    await apiFetch(`/tutors/${tutorId}/semesters`, {
      method: "POST",
      body: JSON.stringify({ id_semestre: Number(semesterId) }),
    });

    setTutors((prev) => prev.map((tutor) => (
      tutor.id_tutor === tutorId
        ? {
            ...tutor,
            semesters: [
              ...(tutor.semesters || []),
              semesters.find((semester) => String(semester.id_semestre) === String(semesterId)),
            ].filter(Boolean),
          }
        : tutor
    )));
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
    setStudents((prev) => [...prev, { ...studentData, semester: activeSemester }]);
    setModal(null);
  };

  const handleAddTutor = (tutorData) => {
    setTutors((prev) => [...prev, { ...tutorData, semesters: activeSemester ? [activeSemester] : [] }]);
    setModal(null);
  };

  const handleAddSemester = async (semesterData) => {
    setSemesters((prev) => {
      const next = prev
        .filter((semester) => String(semester.id_semestre) !== String(semesterData.id_semestre))
        .map((semester) => (semesterData.activo ? { ...semester, activo: false } : semester));
      return [semesterData, ...next];
    });

    if (semesterData.activo || !selectedSemesterId) {
      await handleSemesterChange(String(semesterData.id_semestre));
    }

    setModal(null);
  };

  if (loading) return <div className="admin-root" style={{ color: "#fff", padding: "2rem" }}>Cargando...</div>;
  if (errorCarga) {
    return (
      <div className="admin-root" style={{ color: "#fff", padding: "2rem", display: "grid", gap: 12 }}>
        <p style={{ color: "#f87171" }}>Error: {errorCarga}</p>
        <button className="btn-add-primary" onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

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
          <button className="semester-create-btn" onClick={() => setModal("semestre")}>
            Crear semestre
          </button>
          <div className="semester-switcher">
            <span className="admin-welcome">Bienvenido, {adminName.split(" ")[0]}</span>
            <select
              className="dashboard-select dashboard-select--compact"
              value={selectedSemesterId}
              onChange={(e) => handleSemesterChange(e.target.value)}
            >
              {semesters.map((semester) => (
                <option key={semester.id_semestre} value={semester.id_semestre}>
                  {semester.nombre} {semester.activo ? "(activo)" : ""}
                </option>
              ))}
            </select>
          </div>
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
        <button
          className={`admin-nav-btn ${tab === "bitacoras" ? "active" : ""}`}
          onClick={() => changeTab("bitacoras")}
        >
          Bitácoras pendientes
        </button>
      </nav>

      {/* ── Main content ── */}
      <main className="admin-content">
        <div className="admin-toolbar">
          <input
            className="admin-search"
            placeholder={
              tab === "estudiantes"
                ? "Filtrar estudiantes"
                : tab === "tutores"
                  ? "Filtrar tutores"
                  : "Filtrar bitácoras"
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {tab !== "bitacoras" ? (
            <button className="btn-add-primary" onClick={() => setModal(tab === "estudiantes" ? "estudiante" : "tutor")}>
              {tab === "estudiantes" ? "Añadir estudiante" : "Añadir tutor"}
            </button>
          ) : null}
        </div>

        {tab === "estudiantes" && (
          <div className="cards-list">
            {filteredStudents.map((s) => (
               <StudentCard key={s.id || s.id_estudiante} student={s} />
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
                 <TutorCard
                   key={t.id || t.id_tutor}
                   tutor={t}
                  availableSemesters={semesters}
                  semesterId={selectedSemesterId}
                  onAddLog={handleAddLog}
                  onEnrollSemester={handleEnrollTutorSemester}
                  onUpdateServiceHours={handleUpdateServiceHours}
                />
              ))}
            </div>
          </>
        )}

        {tab === "bitacoras" && (
          <div className="cards-list">
            {pendingBitacoras
              .filter((b) =>
                `${b.estudiante} ${b.tutor} ${b.semestre} ${b.notas ?? ""}`.toLowerCase().includes(search.toLowerCase())
              )
              .map((b) => (
                <div key={b.id} className="card">
                  <div className="card-top-row">
                    <div className="card-name-group">
                      <h2 className="card-student-name">{b.estudiante}</h2>
                      <span className={`status-pill ${statusClass(b.estado)}`}>{b.estado}</span>
                    </div>
                    <span className="tutor-tag">{b.tutor}</span>
                  </div>
                  <div className="bitacora-meta" style={{ marginTop: 10 }}>
                    <span className="meta-chip">{b.fecha}</span>
                    <span className="meta-chip">{b.semestre}</span>
                    <span className="meta-chip">{b.duracion_horas} hr</span>
                  </div>
                  <p className="bitacora-notas" style={{ marginTop: 10 }}>{b.notas}</p>
                  {b.evidencia_url ? (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setPreviewImage(resolveEvidenceSrc(b.evidencia_url))}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setPreviewImage(resolveEvidenceSrc(b.evidencia_url)); }}
                      style={{
                        marginTop: 14,
                        width: 180,
                        height: 110,
                        marginLeft: "auto",
                        marginRight: "auto",
                        borderRadius: 10,
                        overflow: "hidden",
                        border: "1.5px solid #2a2a2a",
                        background: "#111",
                        cursor: "zoom-in",
                      }}
                    >
                      <img
                        src={resolveEvidenceSrc(b.evidencia_url)}
                        alt="Evidencia de bitácora"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    </div>
                  ) : (
                    <p style={{ marginTop: 10, fontSize: "var(--font-xs)", color: "var(--color-text-muted)", fontStyle: "italic" }}>
                      Sin evidencia adjunta
                    </p>
                  )}
                  <div className="modal-actions" style={{ justifyContent: "flex-start", marginTop: 12 }}>
                    <button className="btn-add-primary" onClick={() => handleBitacoraUpdate(b.id, "Aprobado")}>Aprobar</button>
                    <button className="btn-modal-cancel" onClick={() => handleBitacoraUpdate(b.id, "No aprobado")}>No aprobar</button>
                  </div>
                </div>
              ))}
          </div>
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
          activeSemester={activeSemester}
          onConfirm={handleAddTutor}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "semestre" && (
        <ModalAddSemester
          onConfirm={handleAddSemester}
          onClose={() => setModal(null)}
        />
      )}
      {previewImage && (
        <ImageModal
          src={previewImage}
          alt="Evidencia de bitácora"
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
}
