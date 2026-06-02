import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import SocialLogin from '../components/auth/SocialLogin'
import ValidationModal from '../components/layout/ValidationModal'
import { useAuth } from '../hooks'

const ROLES = [
  { id: 'patient', label: 'Paciente' },
  { id: 'doctor', label: 'Doctor' },
  { id: 'admin', label: 'Administrador' },
]

const ROLE_HOME = {
  patient: '/dashboard',
  doctor: '/doctor',
  admin: '/admin',
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, user } = useAuth()
  const [role, setRole] = useState('patient')
  const [formData, setFormData] = useState({ email: '', password: '', remember: false })
  const [errors, setErrors] = useState({})
  const successMessage = location.state?.successMessage || ''
  const validationMessages = Object.values(errors).filter(Boolean)

  useEffect(() => {
    if (isAuthenticated && user?.role === role) {
      navigate(ROLE_HOME[role] || '/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate, role, user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = {}
    if (!formData.email) next.email = 'El correo es obligatorio'
    if (!formData.password) next.password = 'La contraseña es obligatoria'
    if (Object.keys(next).length) {
      setErrors(next)
      return
    }

    const result = await login(formData.email, formData.password, role)
    if (result.success) {
      navigate(ROLE_HOME[role] || '/dashboard')
    } else {
      setErrors({ password: result.error })
    }
  }

  return (
    <div className="sy-page sy-page--gray">
      <div className="sy-login-back">
        <Link to="/" className="sy-logo sy-logo--blue">
          Salud<span>Ya</span>
        </Link>
        <Link to="/" style={{ color: 'var(--sy-teal)', textDecoration: 'none', fontWeight: 600 }}>
          ← Volver al inicio
        </Link>
      </div>

      <div className="sy-login-card">
        <aside className="sy-auth-hero sy-auth-hero--teal">
          <h1>Tu santuario de una atención médica eficiente.</h1>
          <p>
            Experimenta un enfoque de conserjería premium para la gestión médica. Sin interrupciones,
            intuitivo y diseñado para la claridad.
          </p>
          <div className="sy-trust-inline">
            <div className="sy-avatar" aria-hidden />
            <div className="sy-avatar" aria-hidden style={{ marginLeft: -12 }} />
            <span style={{ background: 'var(--sy-teal-dark)', padding: '6px 10px', borderRadius: 999 }}>
              +2k
            </span>
            <span>Con la confianza de más de 2.000 profesionales médicos</span>
          </div>
        </aside>

        <div className="sy-auth-form-wrap">
          <h2>Bienvenido de nuevo</h2>
          {successMessage && (
            <p style={{ color: 'var(--sy-success)', marginBottom: 12 }}>
              {successMessage}
            </p>
          )}
          <ValidationModal
            isOpen={validationMessages.length > 0}
            title="Validación"
            messages={validationMessages}
            onClose={() => setErrors({})}
          />
          <p>Inicie sesión con su usuario y contraseña o con Google, Apple o Microsoft.</p>

          <div className="sy-role-tabs" role="tablist">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                role="tab"
                className={role === r.id ? 'is-active' : ''}
                onClick={() => setRole(r.id)}
              >
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="sy-field">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                placeholder="nombre@salud.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="sy-field">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label htmlFor="password">Contraseña</label>
                <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--sy-teal)' }}>
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <label className="sy-checkbox">
              <input
                type="checkbox"
                checked={formData.remember}
                onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
              />
              <span>Recuérdame por 30 días</span>
            </label>

            <button type="submit" className="sy-btn sy-btn--primary sy-btn--block sy-btn--lg">
              Iniciar sesión con usuario y contraseña →
            </button>
          </form>

          <SocialLogin role={role} />

          <p style={{ marginTop: 24, textAlign: 'center', color: 'var(--sy-text-muted)' }}>
            ¿No tienes una cuenta?{' '}
            <Link to="/register" style={{ color: 'var(--sy-teal)', fontWeight: 600 }}>
              Solicitar acceso
            </Link>
          </p>
        </div>
      </div>

      <footer style={{ textAlign: 'center', padding: '24px', color: 'var(--sy-text-muted)', fontSize: '0.75rem' }}>
        <p>© 2026 SALUDYA. SANTUARIO DE EFICIENCIA.</p>
        <nav style={{ marginTop: 8, display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Link to="/legal/privacy">Política de privacidad</Link>
          <Link to="/legal/terms">Términos de servicio</Link>
          <Link to="/legal/support">Soporte</Link>
        </nav>
      </footer>
    </div>
  )
}
