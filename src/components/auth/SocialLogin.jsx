import { GoogleLogin } from '@react-oauth/google'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getMsalInstance, msalLoginRequest } from '../../config/msalConfig'
import { useAuth } from '../../hooks'
import {
  hasGoogleClientId,
  hasMicrosoftClientId,
  validateProviderEmail,
} from '../../utils/socialAuth'
import ValidationModal from '../layout/ValidationModal'

const ROLE_HOME = {
  patient: '/dashboard',
  doctor: '/doctor',
  admin: '/admin',
}

function ProviderFallbackModal({ provider, onClose, onSubmit, loading, error }) {
  const [email, setEmail] = useState('')
  const isGoogle = provider === 'google'
  const isApple = provider === 'apple'

  return (
    <div className="sy-modal" role="dialog" aria-modal="true">
      <button type="button" className="sy-modal__backdrop" aria-label="Cerrar" onClick={onClose} />
      <div className="sy-modal__panel" style={{ maxWidth: 420 }}>
        <header className="sy-modal__header">
          <h2 style={{ fontSize: '1.25rem' }}>
            {isGoogle ? 'Iniciar con Google' : isApple ? 'Iniciar con Apple' : 'Iniciar con Outlook / Hotmail'}
          </h2>
          <button type="button" className="sy-modal__close" onClick={onClose}>×</button>
        </header>
        <div className="sy-modal__body">
          <p style={{ color: 'var(--sy-text-muted)', marginBottom: 16, fontSize: '0.9rem' }}>
            {isGoogle
              ? 'Ingrese su correo de Gmail. En producción configure VITE_GOOGLE_CLIENT_ID para OAuth real.'
              : isApple
              ? 'Ingrese su correo de Apple. En producción configure la integración de Apple OAuth para inicio real.'
              : 'Ingrese su correo de Microsoft (Outlook, Hotmail o Live). Configure VITE_MICROSOFT_CLIENT_ID para OAuth real.'}
          </p>
          <div className="sy-field">
            <label htmlFor="social-email">Correo electrónico</label>
            <input
              id="social-email"
              type="email"
              placeholder={isGoogle ? 'usuario@gmail.com' : isApple ? 'usuario@icloud.com' : 'usuario@outlook.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {error && (
            <p style={{ color: 'var(--sy-danger)', fontSize: '0.85rem' }}>{error}</p>
          )}
        </div>
        <footer className="sy-modal__footer">
          <button type="button" className="sy-btn sy-btn--outline" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="sy-btn sy-btn--primary"
            disabled={loading}
            onClick={() => onSubmit(email)}
          >
            {loading ? 'Conectando...' : 'Continuar'}
          </button>
        </footer>
      </div>
    </div>
  )
}

export default function SocialLogin({ role = 'patient' }) {
  const navigate = useNavigate()
  const { loginWithOAuth } = useAuth()
  const [fallbackProvider, setFallbackProvider] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const finishLogin = async (payload) => {
    setLoading(true)
    setError('')
    const result = await loginWithOAuth(payload, role)
    setLoading(false)
    if (result.success) {
      setFallbackProvider(null)
      navigate(ROLE_HOME[role] || '/dashboard')
    } else {
      setError(result.error || 'No se pudo iniciar sesión')
    }
  }

  const handleGoogleSuccess = (credentialResponse) => {
    finishLogin({
      provider: 'google',
      credential: credentialResponse.credential,
    })
  }

  const handleMicrosoft = async () => {
    const msal = getMsalInstance()
    if (!msal) {
      setFallbackProvider('microsoft')
      return
    }
    try {
      setLoading(true)
      await msal.initialize()
      const result = await msal.loginPopup(msalLoginRequest)
      const account = result.account
      await finishLogin({
        provider: 'microsoft',
        email: account.username,
        name: account.name,
        credential: result.idToken,
      })
    } catch (err) {
      if (err?.errorCode !== 'user_cancelled') {
        setError('No se pudo completar el inicio con Microsoft.')
      }
      setLoading(false)
    }
  }

  const handleFallbackSubmit = (email) => {
    const validation = validateProviderEmail(fallbackProvider, email)
    if (!validation.valid) {
      setError(validation.error)
      return
    }
    finishLogin({
      provider: fallbackProvider,
      email: email.trim(),
      name: email.split('@')[0],
    })
  }

  return (
    <>
      <p className="sy-divider">O CONTINUAR CON</p>
      <div className="sy-social-login">
        {hasGoogleClientId ? (
          <div className="sy-social-login__google">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Error al conectar con Google.')}
              text="continue_with"
              locale="es"
              shape="rectangular"
              size="large"
              width="100%"
            />
          </div>
        ) : (
          <button
            type="button"
            className="sy-btn sy-btn--social sy-btn--gmail"
            disabled={loading}
            onClick={() => setFallbackProvider('google')}
          >
            <span className="sy-social-icon" aria-hidden>
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path fill="#4285F4" d="M21.35 11.1H12v2.8h5.32c-.23 1.3-.93 2.4-1.97 3.15v2.6h3.18c1.85-1.7 2.92-4.2 2.92-6.85 0-.55-.05-1.05-.15-1.55z"/>
                <path fill="#34A853" d="M12 22c2.7 0 4.95-.9 6.6-2.45l-3.18-2.6c-.9.6-2.05.95-3.42.95-2.63 0-4.85-1.78-5.64-4.2H1.98v2.64C3.59 19.88 7.52 22 12 22z"/>
                <path fill="#FBBC05" d="M6.36 13.7c-.2-.6-.34-1.25-.34-1.7s.14-1.1.34-1.7V7.66H1.98C1.35 8.9 1 10.42 1 12c0 1.58.35 3.03.98 4.34l4.38-2.64z"/>
                <path fill="#EA4335" d="M12 4.8c1.47 0 2.8.5 3.84 1.48l2.87-2.87C16.95 1.74 14.58.8 12 .8 7.52.8 3.59 2.92 1.98 6.34l4.38 2.64C7.15 6.58 9.37 4.8 12 4.8z"/>
              </svg>
            </span>
            Continuar con Google
          </button>
        )}

        <button
          type="button"
          className="sy-btn sy-btn--social sy-btn--apple"
          disabled={loading}
          onClick={() => setFallbackProvider('apple')}
        >
          <span className="sy-social-icon sy-social-icon--apple" aria-hidden>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path fill="#000" d="M16.365 1.43c0 1.14-.42 2.25-1.1 3.1-.74.97-1.96 1.85-3.12 1.85-.08-1.19.43-2.44 1.12-3.29.75-.92 1.96-1.68 3.1-1.68.07 0 .14 0 .2.02zM12.23 4.3c.98 0 2.05.64 2.78 1.72C16.14 7.5 16.8 9.06 16.8 10.8c0 2.64-1.5 4.05-1.5 4.05s1.4 1.4 1.4 3.95c0 2.45-1.75 3.5-3.3 3.5-1.1 0-1.8-.5-2.6-.5-.86 0-1.6.5-2.7.5-1.55 0-3.3-1.05-3.3-3.5 0-2.55 1.4-3.95 1.4-3.95S7.7 13.44 7.7 10.8c0-2.31.86-4.42 2.28-5.75C11.6 3.24 12.88 2.7 14 2.7c.32 0 .63.02.93.05.08.01.16.02.24.02z"/>
            </svg>
          </span>
          Continuar con Apple
        </button>

        <button
          type="button"
          className="sy-btn sy-btn--social sy-btn--microsoft"
          disabled={loading}
          onClick={hasMicrosoftClientId ? handleMicrosoft : () => setFallbackProvider('microsoft')}
        >
          <span className="sy-social-icon sy-social-icon--ms" aria-hidden>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path fill="#F35325" d="M3 3h8v8H3z"/>
              <path fill="#81BC06" d="M13 3h8v8h-8z"/>
              <path fill="#05A6F0" d="M3 13h8v8H3z"/>
              <path fill="#FFBA08" d="M13 13h8v8h-8z"/>
            </svg>
          </span>
          Continuar con Microsoft
        </button>
      </div>

      <ValidationModal
        isOpen={Boolean(error) && !fallbackProvider}
        title="Validación"
        messages={error ? [error] : []}
        onClose={() => setError('')}
      />

      {fallbackProvider && (
        <ProviderFallbackModal
          provider={fallbackProvider}
          onClose={() => {
            setFallbackProvider(null)
            setError('')
          }}
          onSubmit={handleFallbackSubmit}
          loading={loading}
          error={error}
        />
      )}
    </>
  )
}
