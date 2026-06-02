import { useEffect, useState } from 'react'

const STATUS_OPTIONS = [
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'atendida', label: 'Atendida' },
  { value: 'finalizada', label: 'Finalizada' },
  { value: 'cancelled', label: 'Cancelada' },
]

export default function BookingEditModal({
  isOpen,
  booking,
  title = 'Editar cita',
  submitLabel = 'Guardar cambios',
  onClose,
  onSave,
}) {
  const [draft, setDraft] = useState({
    diagnosis: '',
    prescription: '',
    observations: '',
    status: 'confirmed',
  })

  useEffect(() => {
    if (!isOpen || !booking) return
    setDraft({
      diagnosis: booking.diagnosis || '',
      prescription: booking.prescription || '',
      observations: booking.observations || '',
      status: booking.status || 'confirmed',
    })
  }, [isOpen, booking])

  if (!isOpen || !booking) return null

  return (
    <div className="sy-modal" role="dialog" aria-modal="true" aria-labelledby="booking-edit-title">
      <button type="button" className="sy-modal__backdrop" aria-label="Cerrar" onClick={onClose} />
      <div className="sy-modal__panel" style={{ maxWidth: 560 }}>
        <header className="sy-modal__header">
          <div>
            <h2 id="booking-edit-title">{title}</h2>
            <p className="sy-modal__intro" style={{ marginTop: 8 }}>
              Actualiza el diagnóstico, la receta y el estado de la cita para este paciente.
            </p>
          </div>
          <button type="button" className="sy-modal__close" onClick={onClose} aria-label="Cerrar ventana">
            ×
          </button>
        </header>

        <div className="sy-modal__body">
          <div style={{ display: 'grid', gap: 14, marginBottom: 18 }}>
            <div style={{ display: 'grid', gap: 6 }}>
              <strong>Paciente</strong>
              <span>{booking.patientName}</span>
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
              <strong>Fecha y hora</strong>
              <span>{booking.dateKey} • {booking.time}</span>
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
              <strong>Correo</strong>
              <span>{booking.patientEmail}</span>
            </div>
          </div>

          <div className="sy-field">
            <label htmlFor="booking-diagnosis">Diagnóstico</label>
            <textarea
              id="booking-diagnosis"
              rows={4}
              value={draft.diagnosis}
              onChange={(event) => setDraft((prev) => ({ ...prev, diagnosis: event.target.value }))}
              placeholder="Ingrese el diagnóstico aquí"
            />
          </div>

          <div className="sy-field">
            <label htmlFor="booking-prescription">Receta / Medicamentos</label>
            <textarea
              id="booking-prescription"
              rows={3}
              value={draft.prescription}
              onChange={(event) => setDraft((prev) => ({ ...prev, prescription: event.target.value }))}
              placeholder="Indique la receta o indicaciones"
            />
          </div>

          <div className="sy-field">
            <label htmlFor="booking-observations">Observaciones</label>
            <textarea
              id="booking-observations"
              rows={3}
              value={draft.observations}
              onChange={(event) => setDraft((prev) => ({ ...prev, observations: event.target.value }))}
              placeholder="Notas adicionales sobre la atención"
            />
          </div>

          <div className="sy-field">
            <label htmlFor="booking-status">Estado de la cita</label>
            <select
              id="booking-status"
              value={draft.status}
              onChange={(event) => setDraft((prev) => ({ ...prev, status: event.target.value }))}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <footer className="sy-modal__footer">
          <button type="button" className="sy-btn sy-btn--outline" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="sy-btn sy-btn--primary" onClick={() => onSave(draft)}>
            {submitLabel}
          </button>
        </footer>
      </div>
    </div>
  )
}
