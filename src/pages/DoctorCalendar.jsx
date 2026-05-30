import { useMemo } from 'react'

import { useAuth } from '../hooks'
import { useAppointmentsBookingStore } from '../store/appointmentsBookingStore'
import { useDoctorAvailabilityStore } from '../store/doctorAvailabilityStore'
import { useUsersAdminStore } from '../store/usersAdminStore'

function sortByDateTime(a, b) {
  if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey)
  return a.time.localeCompare(b.time)
}

export default function DoctorCalendar() {
  const { user } = useAuth()
  const doctors = useUsersAdminStore((s) => s.users)

  const currentDoctor = useMemo(
    () => doctors.find((doc) => doc.role === 'doctor' && doc.email?.toLowerCase() === user?.email?.toLowerCase()),
    [doctors, user?.email],
  )
  const doctorId = currentDoctor?.id ?? 'SY-2024-81'

  const bookings = useAppointmentsBookingStore((s) => s.bookings)
  const slots = useDoctorAvailabilityStore((s) => s.slots)

  const doctorBookings = useMemo(
    () => bookings.filter((booking) => booking.doctorId === doctorId),
    [bookings, doctorId],
  )

  const sortedBookings = useMemo(
    () => doctorBookings.slice().sort(sortByDateTime),
    [doctorBookings],
  )

  return (
    <div>
      <h1 style={{ margin: '0 0 8px' }}>Calendario de citas</h1>
      <p style={{ color: 'var(--sy-text-muted)', marginBottom: 24 }}>
        Aquí puedes ver las citas que los pacientes agendan en tiempo real y compararlas con tu disponibilidad.
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 12 }}>Citas programadas</h2>
        {sortedBookings.length === 0 ? (
          <p>No hay citas agendadas para este profesional.</p>
        ) : (
          <ul className="sy-table" style={{ listStyle: 'none', padding: 0 }}>
            {sortedBookings.map((booking) => (
              <li
                key={booking.id}
                style={{
                  padding: 12,
                  borderBottom: '1px solid var(--sy-border)',
                  display: 'grid',
                  gap: 6,
                }}
              >
                <strong>{booking.patientName}</strong>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <span>{booking.dateKey} • {booking.time}</span>
                  <span style={{ color: 'var(--sy-text-muted)' }}>{booking.patientEmail}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 style={{ marginBottom: 12 }}>Bloques de disponibilidad</h2>
        {slots.length === 0 ? (
          <p>No hay bloques de disponibilidad. Usa «Confirmar horario» en el panel para agregar uno.</p>
        ) : (
          <ul className="sy-table" style={{ listStyle: 'none', padding: 0 }}>
            {slots.map((slot) => (
              <li
                key={slot.id}
                style={{
                  padding: 12,
                  borderBottom: '1px solid var(--sy-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>
                  <strong>{slot.date}</strong> · {slot.startTime} – {slot.endTime}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
