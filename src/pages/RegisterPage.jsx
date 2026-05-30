import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import LegalLink from '../components/layout/LegalLink'
import { useAuth } from '../hooks'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    identification: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    acceptTerms: false,
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const validate = () => {
    const next = {}
    if (!formData.identification) next.identification = 'El número de identificación es obligatorio'
    if (!formData.fullName) {
      next.fullName = 'El nombre completo es obligatorio'
    } else {
      const parts = formData.fullName.trim().split(/\s+/)
      if (parts.length < 2 || !parts[0] || !parts[1]) {
        next.fullName = 'Ingrese al menos nombre y apellido'
      }
    }
    if (!formData.email) next.email = 'El correo electrónico es obligatorio'
    if (!formData.password || formData.password.length < 8) {
      next.password = 'Mínimo 8 caracteres, una mayúscula y un símbolo especial'
    }
    if (!formData.acceptTerms) next.acceptTerms = 'Debe aceptar los términos'
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = validate()
    if (Object.keys(next).length) {
      setErrors(next)
      return
    }

    setIsLoading(true)
    const parts = formData.fullName.trim().split(' ')
    const name = parts[0] || ''
    const lastName = parts.slice(1).join(' ') || ''

    const result = await register({
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      identification: formData.identification,
      name,
      lastName,
      nombreCompleto: formData.fullName,
    })

    setIsLoading(false)
    if (result.success) {
      navigate('/login', {
        state: {
          successMessage: 'Registro exitoso. Ya puedes iniciar sesión con tu correo y contraseña.',
        },
      })
    } else {
      setErrors({ general: typeof result.error === 'string' ? result.error : 'Error al registrar' })
    }
  }

  return (
    <div className="sy-page">
      <div className="sy-auth-split">
        <aside className="sy-auth-hero">
          <Link to="/" className="sy-logo">
            Salud<span>Ya</span>
          </Link>
          <span className="sy-badge" style={{ marginTop: 32 }}>
            Únete al futuro
          </span>
          <h1>Tu santuario de eficiencia en salud comienza aquí.</h1>
          <p>
            Experimenta un ecosistema de salud diseñado para la tranquilidad, la precisión clínica
            y una coordinación sin esfuerzo.
          </p>
          <div className="sy-trust-card">
            <div className="sy-avatar" aria-hidden />
            <p>
              Con la confianza de más de <strong>5.000+</strong> profesionales médicos.
            </p>
          </div>
        </aside>

        <div className="sy-auth-form-wrap">
          <h2>Crea tu cuenta</h2>
          <p>
            ¿Ya eres miembro?{' '}
            <Link to="/login" style={{ color: 'var(--sy-teal)', fontWeight: 600 }}>
              Inicia sesión en tu espacio de trabajo
            </Link>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="sy-field">
              <label htmlFor="identification">Número de identificación</label>
              <input
                id="identification"
                name="identification"
                placeholder="Ej. 123456789"
                value={formData.identification}
                onChange={handleChange}
              />
              {errors.identification && <span className="sy-field-hint" style={{ color: 'var(--sy-danger)' }}>{errors.identification}</span>}
            </div>

            <div className="sy-field">
              <label htmlFor="fullName">Nombre completo</label>
              <input
                id="fullName"
                name="fullName"
                placeholder="Juan Pérez"
                value={formData.fullName}
                onChange={handleChange}
              />
              {errors.fullName && <span className="sy-field-hint" style={{ color: 'var(--sy-danger)' }}>{errors.fullName}</span>}
            </div>

            <div className="sy-field">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="nombre@saludya.com"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <span className="sy-field-hint" style={{ color: 'var(--sy-danger)' }}>{errors.email}</span>}
            </div>

            <div className="sy-field">
              <label htmlFor="phone">Número de teléfono</label>
              <input
                id="phone"
                name="phone"
                placeholder="+51 999 999 999"
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && <span className="sy-field-hint" style={{ color: 'var(--sy-danger)' }}>{errors.phone}</span>}
            </div>

            <div className="sy-field">
              <label htmlFor="password">Contraseña de seguridad</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <span className="sy-field-hint" style={{ color: 'var(--sy-danger)' }}>{errors.password}</span>}
              <p className="sy-field-hint">
                Al menos 8 caracteres, incluyendo una mayúscula y un símbolo especial.
              </p>
            </div>

            <label className="sy-checkbox">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
              />
              <span>
                Acepto los <LegalLink slug="terms">Términos de servicio</LegalLink> y la{' '}
                <LegalLink slug="privacy">Política de privacidad</LegalLink>, incluyendo cómo SaludYa gestiona
                los datos médicos sensibles.
              </span>
            </label>
            {errors.acceptTerms && (
              <p style={{ color: 'var(--sy-danger)', marginBottom: 12 }}>{errors.acceptTerms}</p>
            )}

            {errors.general && (
              <p style={{ color: 'var(--sy-danger)', marginBottom: 12 }}>{errors.general}</p>
            )}

            <button type="submit" className="sy-btn sy-btn--primary sy-btn--block sy-btn--lg" disabled={isLoading}>
              {isLoading ? 'Registrando...' : 'Crear cuenta →'}
            </button>
          </form>

          <p style={{ marginTop: 20, fontSize: '0.9rem', color: 'var(--sy-text-muted)' }}>
            ¿Necesitas ayuda con el registro?{' '}
            <LegalLink slug="support" style={{ color: 'var(--sy-teal)' }}>
              Contactar con soporte
            </LegalLink>
          </p>
        </div>
      </div>

      <div className="sy-auth-footer-bar">
        <span>© 2026 SaludYa. Santuario de eficiencia.</span>
        <div>
          <LegalLink slug="security">Estándares de seguridad</LegalLink>
          <LegalLink slug="compliance">Cumplimiento</LegalLink>
          <LegalLink slug="portability">Portabilidad de datos</LegalLink>
        </div>
      </div>
    </div>
  )
}
