const DEFAULT_NOTIFICATIONS = [
  { id: 'n1', text: 'Nueva cita confirmada para las 10:15 AM', unread: true },
  { id: 'n2', text: 'Recordatorio: revisión de historial clínico', unread: true },
  { id: 'n3', text: 'Actualización de política de privacidad', unread: false },
]

export default function NotificationsPanel({ isOpen, onClose, notifications = DEFAULT_NOTIFICATIONS }) {
  if (!isOpen) return null

  return (
    <div
      className="sy-notifications-panel"
      role="region"
      aria-label="Notificaciones"
      style={{
        position: 'absolute',
        right: 0,
        top: '100%',
        marginTop: 8,
        background: '#fff',
        border: '1px solid var(--sy-border)',
        borderRadius: 12,
        padding: 12,
        minWidth: 280,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        zIndex: 20,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <strong>Notificaciones</strong>
        <button type="button" className="sy-portal__link-btn" onClick={onClose}>
          Cerrar
        </button>
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {notifications.map((n) => (
          <li
            key={n.id}
            style={{
              padding: '8px 0',
              borderBottom: '1px solid var(--sy-border)',
              fontWeight: n.unread ? 600 : 400,
            }}
          >
            {n.text}
          </li>
        ))}
      </ul>
    </div>
  )
}
