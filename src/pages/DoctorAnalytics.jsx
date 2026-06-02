import { useMemo } from 'react'

import { useAuth } from '../hooks'
import { useAppointmentsBookingStore } from '../store/appointmentsBookingStore'
import { useUsersAdminStore } from '../store/usersAdminStore'
import { getMonthStartKey } from '../utils/colombianHolidays'

export default function DoctorAnalytics() {
  const { user } = useAuth()
  const doctors = useUsersAdminStore((s) => s.users)
  const bookings = useAppointmentsBookingStore((s) => s.bookings)

  const currentDoctor = useMemo(
    () => doctors.find((doc) => doc.role === 'doctor' && doc.email?.toLowerCase() === user?.email?.toLowerCase()),
    [doctors, user?.email],
  )

  const doctorId = currentDoctor?.id ?? 'SY-2024-81'
  const doctorName = currentDoctor?.name ?? user?.nombreCompleto ?? user?.name ?? 'el especialista'

  const metrics = useMemo(() => {
    const now = new Date()
    const monthStartKey = getMonthStartKey(now)

    const monthlyBookings = bookings
      .filter((booking) => booking.doctorId === doctorId)
      .filter((booking) => booking.dateKey >= monthStartKey)

    const completedCount = monthlyBookings.filter((booking) =>
      ['atendida', 'completed', 'finalizada'].includes(booking.status),
    ).length

    const totalAttended = monthlyBookings.filter((booking) => booking.status !== 'cancelled').length
    const attendanceRate = totalAttended > 0 ? `${Math.round((completedCount / totalAttended) * 100)}%` : 'N/A'
    const uniquePatients = new Set(monthlyBookings.map((booking) => booking.patientEmail)).size
    const cancellations = monthlyBookings.filter((booking) => booking.status === 'cancelled').length

    return [
      { label: 'Citas completadas este mes', value: `${completedCount}` },
      { label: 'Tasa de asistencia', value: attendanceRate },
      { label: 'Pacientes distintos', value: `${uniquePatients}` },
      { label: 'Cancelaciones', value: `${cancellations}` },
    ]
  }, [bookings, doctorId])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: '0 0 8px' }}>Analíticas</h1>
          <p style={{ color: 'var(--sy-text-muted)', marginBottom: 24 }}>
            Resumen de actividad clínica para {doctorName} durante el mes actual.
          </p>
        </div>
      </div>

      <div className="sy-portal-stats" style={{ flexWrap: 'wrap' }}>
        {metrics.map((m) => (
          <div key={m.label} className="sy-stat-mini">
            <span>{m.label}</span>
            <strong>{m.value}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}
