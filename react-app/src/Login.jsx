import { useState } from "react";
import './Login.css'

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor completa todos los campos.");
      return;
    }

    setLoading(true);
    // Simulación de llamada a API
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);

    if (onLogin) {
      onLogin({ email, password });
    } else {
      setError("Credenciales incorrectas. Intenta de nuevo.");
    }
  };

  return (
    <>
      <div className="lf-wrap">
        <div className="lf-card">

          <div className="lf-brand">
            <div className="lf-mark">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="5" height="5" rx="1" fill="#F1EFE8"/>
                <rect x="9" y="2" width="5" height="5" rx="1" fill="#F1EFE8" opacity="0.5"/>
                <rect x="2" y="9" width="5" height="5" rx="1" fill="#F1EFE8" opacity="0.5"/>
                <rect x="9" y="9" width="5" height="5" rx="1" fill="#F1EFE8"/>
              </svg>
            </div>
            <span className="lf-brand-name">ARPA</span>
          </div>

          <h1 className="lf-heading">Bienvenido de vuelta</h1>
          <p className="lf-sub">Ingresa tus credenciales para continuar</p>

          <form onSubmit={handleSubmit} noValidate>

            <div className="lf-field">
              <label className="lf-label" htmlFor="lf-email">Correo electrónico</label>
              <input
                id="lf-email"
                className="lf-input"
                type="email"
                placeholder="nombre@empresa.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="lf-field">
              <label className="lf-label" htmlFor="lf-password">Contraseña</label>
              <div className="lf-input-wrap">
                <input
                  id="lf-password"
                  className="lf-input has-toggle"
                  type={showPass ? "text" : "password"}
                  placeholder="contraseña"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="lf-toggle"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="lf-error">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </p>
            )}

            <label className="lf-row">
              <input type="checkbox" className="lf-checkbox" />
              <span className="lf-remember">Recordarme</span>
            </label>

            <button className="lf-btn" type="submit" disabled={loading}>
              {loading ? <><div className="lf-spinner" /> Verificando...</> : "Iniciar sesión"}
            </button>

          </form>
        </div>
      </div>
    </>
  );
}