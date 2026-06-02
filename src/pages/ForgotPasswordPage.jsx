import { useState } from 'react'
import { Link } from 'react-router-dom'

import ValidationModal from '../components/layout/ValidationModal'
import { authApi } from '../services/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Ingrese su correo electrónico.')
      return
    }
    setLoading(true)
    const result = await authApi.requestPasswordReset(email.trim())
    setLoading(false)
    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || 'No se pudo enviar el enlace.')
    }
  }

  return (
    <div className="sy-page sy-page--gray" style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
      <div className="sy-login-card" style={{ maxWidth: 440, width: '100%' }}>
        <h1>Recuperar contraseña</h1>
        <p style={{ color: 'var(--sy-text-muted)' }}>
          Le enviaremos un enlace para restablecer su contraseña si el correo está registrado.
        </p>
        {success ? (
          <p role="status" style={{ color: 'var(--sy-success)' }}>
            Si el correo existe en nuestro sistema, recibirá instrucciones en breve.
          </p>
        ) : (
          <>
            <form onSubmit={handleSubmit}>
              <div className="sy-field">
                <label htmlFor="forgot-email">Correo electrónico</label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button type="submit" className="sy-btn sy-btn--primary sy-btn--block" disabled={loading}>
                {loading ? 'Enviando…' : 'Enviar enlace'}
              </button>
            </form>
            <ValidationModal
              isOpen={Boolean(error)}
              title="Validación"
              messages={error ? [error] : []}
              onClose={() => setError('')}
            />
          </>
        )}
        <p style={{ marginTop: 24 }}>
          <Link to="/login" style={{ color: 'var(--sy-teal)', fontWeight: 600 }}>
            ← Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
