import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import AppFooter from '../components/layout/AppFooter'
import AppNavbar from '../components/layout/AppNavbar'
import { useAuth } from '../hooks'
import { useAuthStore } from '../store/authStore'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [nombreCompleto, setNombreCompleto] = useState(user?.nombreCompleto || '')
  const [email, setEmail] = useState(user?.email || '')
  const [message, setMessage] = useState('')

  const handleSave = (e) => {
    e.preventDefault()
    if (!nombreCompleto.trim() || !email.trim()) {
      setMessage('Complete nombre y correo.')
      return
    }
    useAuthStore.getState().setUser({ ...user, nombreCompleto: nombreCompleto.trim(), email: email.trim() })
    setMessage('Perfil actualizado correctamente.')
  }

  return (
    <div className="sy-page sy-page--gray">
      <AppNavbar />
      <main className="sy-app-main" style={{ maxWidth: 560 }}>
        <header className="sy-page-header">
          <span className="sy-kicker">Cuenta</span>
          <h1>Mi perfil</h1>
        </header>
        <form className="sy-schedule-card" onSubmit={handleSave}>
          <div className="sy-field">
            <label htmlFor="profile-name">Nombre completo</label>
            <input
              id="profile-name"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
            />
          </div>
          <div className="sy-field">
            <label htmlFor="profile-email">Correo electrónico</label>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {message && <p style={{ color: 'var(--sy-teal)' }}>{message}</p>}
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button type="submit" className="sy-btn sy-btn--primary">
              Guardar cambios
            </button>
            <button type="button" className="sy-btn sy-btn--outline" onClick={() => navigate('/dashboard')}>
              Cancelar
            </button>
          </div>
        </form>
      </main>
      <AppFooter />
    </div>
  )
}
