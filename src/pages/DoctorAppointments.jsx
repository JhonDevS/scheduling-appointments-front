import { useMemo, useState } from 'react'

import BookingEditModal from '../components/layout/BookingEditModal'
import { useAuth } from '../hooks'
import { useAppointmentsBookingStore } from '../store/appointmentsBookingStore'
import { useUsersAdminStore } from '../store/usersAdminStore'
import { getTodayKey,parseDateKey } from '../utils/colombianHolidays'

const STATUS_LABEL = {
  confirmed: { text: 'Confirmada', className: 'sy-status-dot--ok' },
  completed: { text: 'Completada', className: 'sy-status-dot--ok' },
  cancelled: { text: 'Cancelada', className: 'sy-status-dot--cancel' },
  finalizada: { text: 'Finalizada', className: 'sy-status-dot--ok' },
  atendida: { text: 'Atendida', className: 'sy-status-dot--ok' },
}

function formatDate(dateKey) {
  const date = parseDateKey(dateKey)
  return date
    ? date.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : dateKey
}

function getBookingStatus(booking) {
  const todayKey = getTodayKey()
  return booking.status || (booking.dateKey >= todayKey ? 'confirmed' : 'completed')
}

export default function DoctorAppointments() {
  const { user } = useAuth()
  const doctors = useUsersAdminStore((s) => s.users)
  const currentDoctor = useMemo(
    () => doctors.find((doc) => doc.role === 'doctor' && doc.email?.toLowerCase() === user?.email?.toLowerCase()),
    [doctors, user?.email],
  )
  const doctorId = currentDoctor?.id ?? 'SY-2024-81'
  const bookings = useAppointmentsBookingStore((s) => s.bookings)
  const updateBooking = useAppointmentsBookingStore((s) => s.updateBooking)

  const doctorBookings = useMemo(
    () => bookings.filter((booking) => booking.doctorId === doctorId),
    [bookings, doctorId],
  )

  const [selectedBooking, setSelectedBooking] = useState(null)
  const [bookingEditOpen, setBookingEditOpen] = useState(false)
  const [message, setMessage] = useState('')

  const sortedBookings = useMemo(
    () => doctorBookings.slice().sort((a, b) => {
      if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey)
      return a.time.localeCompare(b.time)
    }),
    [doctorBookings],
  )

  const openBookingEdit = (booking) => {
    setSelectedBooking(booking)
    setBookingEditOpen(true)
    setMessage('')
  }

  const handleSaveBooking = (draft) => {
    if (!selectedBooking) return

    updateBooking(selectedBooking.id, {
      diagnosis: draft.diagnosis.trim(),
      prescription: draft.prescription.trim(),
      observations: draft.observations.trim(),
      status: draft.status,
    })
    setBookingEditOpen(false)
    setSelectedBooking(null)
    setMessage('Cita actualizada correctamente.')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <span className="sy-kicker">Panel médico</span>
          <h1 style={{ margin: '8px 0' }}>
            Citas de {currentDoctor?.name || user?.nombreCompleto || user?.name || 'el doctor'}
          </h1>
          <p style={{ color: 'var(--sy-text-muted)', maxWidth: 620 }}>
            {currentDoctor
              ? 'Aquí se muestran todas las citas asignadas a este especialista. Use los detalles para guardar diagnóstico, receta y observaciones.'
              : 'No se encontró un perfil médico vinculado a esta sesión. Se muestran citas de un ejemplo de doctor asignado.'}
          </p>
        </div>
        <div className="sy-stat-mini" style={{ minWidth: 180 }}>
          <span>Total de citas</span>
          <strong>{sortedBookings.length}</strong>
          <small>{sortedBookings.filter((item) => item.dateKey >= getTodayKey()).length} próximas</small>
        </div>
      </div>

      {message && (
        <div style={{ marginTop: 18, padding: 14, borderRadius: 12, background: '#ecfdf5', color: '#065f46' }}>
          {message}
        </div>
      )}

      {sortedBookings.length === 0 ? (
        <p style={{ marginTop: 24, color: 'var(--sy-text-muted)' }}>
          No hay citas registradas para este profesional.
        </p>
      ) : (
        <div className="sy-table" style={{ marginTop: 24 }}>
          {sortedBookings.map((booking) => {
            const status = getBookingStatus(booking)

            return (
              <div
                key={booking.id}
                className="sy-table-row"
                style={{ display: 'grid', gap: 10, padding: 18, borderBottom: '1px solid var(--sy-border)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <strong>{booking.patientName}</strong>
                    <p style={{ color: 'var(--sy-text-muted)', fontSize: '0.9rem' }}>{booking.patientEmail}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className={`sy-status-dot ${STATUS_LABEL[status]?.className || 'sy-status-dot--ok'}`}>
                      ● {STATUS_LABEL[status]?.text || 'Programada'}
                    </span>
                    <button
                      type="button"
                      className="sy-btn sy-btn--outline"
                      onClick={() => openBookingEdit(booking)}
                    >
                      Editar cita
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <span>{formatDate(booking.dateKey)}</span>
                  <span>{booking.time}</span>
                </div>

                {(status === 'finalizada' || status === 'atendida') && ( 
                  <div style={{ padding: 16, borderRadius: 12, background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.18)' }}>
                    <p style={{ margin: 0 }}><strong>Diagnóstico:</strong> {booking.diagnosis || 'No registrado'}</p>
                    <p style={{ margin: '8px 0 0' }}><strong>Receta:</strong> {booking.prescription || 'No registrada'}</p>
                    <p style={{ margin: '8px 0 0' }}><strong>Observaciones:</strong> {booking.observations || 'No hay observaciones'}</p>
                  </div>
                )}

              </div>
            )
          })}
        </div>
      )}
      {selectedBooking && (
        <BookingEditModal
          isOpen={bookingEditOpen}
          booking={selectedBooking}
          onClose={() => {
            setBookingEditOpen(false)
            setSelectedBooking(null)
          }}
          onSave={handleSaveBooking}
        />
      )}
    </div>
  )
}
