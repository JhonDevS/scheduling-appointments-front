import { useState } from 'react'

import { useAuthStore } from '../store/authStore'

export default function DoctorSettings() {
  const user = useAuthStore((s) => s.user)
  const notifyEmail = useAuthStore((s) => s.notifyEmail)
  const notifySms = useAuthStore((s) => s.notifySms)
  const setNotifyEmail = useAuthStore((s) => s.setNotifyEmail)
  const setNotifySms = useAuthStore((s) => s.setNotifySms)
  const [saved, setSaved] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <h1 style={{ margin: '0 0 8px' }}>Configuración</h1>
      <p style={{ color: 'var(--sy-text-muted)', marginBottom: 24 }}>
        Preferencias del portal para {user?.nombreCompleto || user?.name || 'su cuenta'}.
      </p>
      <form className="sy-stats-card" onSubmit={handleSave} style={{ maxWidth: 480 }}>
        <label className="sy-checkbox">
          <input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} />
          <span>Notificaciones por correo</span>
        </label>
        <label className="sy-checkbox" style={{ display: 'block', marginTop: 12 }}>
          <input type="checkbox" checked={notifySms} onChange={(e) => setNotifySms(e.target.checked)} />
          <span>Recordatorios por SMS</span>
        </label>
        <button type="submit" className="sy-btn sy-btn--primary" style={{ marginTop: 20 }}>
          Guardar preferencias
        </button>
        {saved && <p style={{ color: 'var(--sy-success)', marginTop: 12 }}>Preferencias guardadas.</p>}
      </form>
    </div>
  )
}
