import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import AppFooter from '../components/layout/AppFooter'
import AppNavbar from '../components/layout/AppNavbar'
import { useAuth } from '../hooks'
import { useAppointmentsBookingStore } from '../store/appointmentsBookingStore'
import { usePrescriptionRenewalsStore } from '../store/prescriptionRenewalsStore'
import { useUsersAdminStore } from '../store/usersAdminStore'
import { parseTime12h } from '../utils/bookingSchedule'
import { getTodayKey,parseDateKey } from '../utils/colombianHolidays'
import { downloadTextFile } from '../utils/downloadFile'

const PRESCRIPTIONS = [
  { name: 'Amoxicilina', dose: '500 mg • Dos veces al día después de las comidas', footer: 'Termina en 4 días', status: 'active' },
  { name: 'Lisinopril', dose: '10 mg • Una vez al día por la mañana', footer: 'Continuo', status: 'active' },
  { name: 'Ibuprofeno', dose: '400 mg • Según sea necesario para el dolor', footer: 'Finalizó el 12 oct.', status: 'done' },
]

const HEALTH_REPORT = `Informe de salud — SaludYa
Frecuencia cardíaca: 72 lpm
Presión arterial: 120/80 mmHg
Peso: 74,5 kg
Generado: ${new Date().toLocaleString('es-CO')}
`

function sortAppointmentsByDateTime(a, b) {
  if (a.dateKey !== b.dateKey) {
    return a.dateKey.localeCompare(b.dateKey)
  }
  return (parseTime12h(a.time) || 0) - (parseTime12h(b.time) || 0)
}

function formatDateLabel(dateKey) {
  const date = parseDateKey(dateKey)
  return date
    ? date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
    : dateKey
}

export default function PatientDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const requestRenewal = usePrescriptionRenewalsStore((s) => s.requestRenewal)
  const isPending = usePrescriptionRenewalsStore((s) => s.isPending)
  const bookings = useAppointmentsBookingStore((s) => s.bookings)
  const removeBooking = useAppointmentsBookingStore((s) => s.removeBooking)
  const doctors = useUsersAdminStore((s) => s.users)

  const [showAllRx, setShowAllRx] = useState(false)
  const [renewalMsg, setRenewalMsg] = useState('')

  const userEmail = user?.email || ''
  const doctorMap = useMemo(
    () =>
      Object.fromEntries(
        doctors
          .filter((u) => u.role === 'doctor')
          .map((doc) => [String(doc.id), { name: doc.name, specialty: doc.specialty || 'Consulta médica' }]),
      ),
    [doctors],
  )

  const patientAppointments = useMemo(() => {
    if (!userEmail) return []
    return bookings
      .filter((booking) => booking.patientEmail === userEmail)
      .sort(sortAppointmentsByDateTime)
  }, [bookings, userEmail])

  const todayKey = getTodayKey()
  const getBookingStatus = (booking) => booking.status || (booking.dateKey >= todayKey ? 'confirmed' : 'completed')
  const upcomingAppointments = useMemo(
    () =>
      patientAppointments.filter(
        (booking) => getBookingStatus(booking) === 'confirmed' && booking.dateKey >= todayKey,
      ),
    [patientAppointments, todayKey, getBookingStatus],
  )
  const nextAppointment = upcomingAppointments[0]
  const nextAppointments = upcomingAppointments.slice(0, 3)
  const prescriptions = showAllRx ? PRESCRIPTIONS : PRESCRIPTIONS.slice(0, 2)

  const handleRenew = (name) => {
    const result = requestRenewal(name)
    setRenewalMsg(result.success ? `Solicitud de renovación enviada para ${name}.` : result.error)
  }

  const handleCancelAppointment = (bookingId) => {
    removeBooking(bookingId)
    setRenewalMsg('Tu cita ha sido cancelada correctamente.')
  }

  const handleReschedule = (appointment) => {
    navigate('/book', { state: { rescheduleAppointment: appointment } })
  }

  const handleHealthReport = () => {
    downloadTextFile('informe-salud-saludya.txt', HEALTH_REPORT)
  }

  return (
    <div className="sy-page sy-page--gray">
      <AppNavbar />

      <main className="sy-app-main">
        <div className="sy-dash-top">
          <header className="sy-page-header">
            <span className="sy-kicker">Panel de control</span>
            <h1>Hola, {user?.nombreCompleto || 'Paciente'}</h1>
            <p>
              {nextAppointment ? (
                <>Tu próxima consulta es con {doctorMap[nextAppointment.doctorId]?.name || 'un especialista'} el {formatDateLabel(nextAppointment.dateKey)} a las {nextAppointment.time}.</>
              ) : (
                'Aún no tienes citas agendadas. Reserva tu primera consulta con un especialista de confianza.'
              )}
            </p>
          </header>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="sy-btn sy-btn--primary sy-btn--lg" onClick={() => navigate('/book')}>
              + Agendar nueva cita
            </button>
            <button type="button" className="sy-btn sy-btn--outline sy-btn--lg" onClick={() => navigate('/appointments')}>
              Mis citas
            </button>
          </div>
        </div>

        {renewalMsg && (
          <p role="status" style={{ color: 'var(--sy-teal)', marginBottom: 16 }}>
            {renewalMsg}
          </p>
        )}

        <div className="sy-dash-layout">
          <div>
            <article className="sy-upcoming-card">
              <div className="sy-upcoming-card__body">
                <span className="sy-pill-green">Próximamente</span>
                {nextAppointments.length > 0 ? (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <h2>{doctorMap[String(nextAppointment.doctorId)]?.name || 'Consulta médica'}</h2>
                    <p style={{ color: 'var(--sy-text-muted)' }}>
                      {doctorMap[String(nextAppointment.doctorId)]?.specialty || 'Especialista SaludYa'}
                    </p>
                    <div className="sy-detail-grid">
                      <div className="sy-detail-box">
                        <span>Fecha</span>
                        <strong>{formatDateLabel(nextAppointment.dateKey)}</strong>
                      </div>
                      <div className="sy-detail-box">
                        <span>Hora</span>
                        <strong>{nextAppointment.time}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: 12 }}>
                    {nextAppointments.map((appointment) => (
                      <div key={appointment.id} className="sy-appt-row" style={{ padding: 12, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04)', borderRadius: 12 }}>
                        <div style={{ flex: 1 }}>
                          <strong>{doctorMap[String(appointment.doctorId)]?.name || 'Especialista SaludYa'}</strong>
                          <p style={{ color: 'var(--sy-text-muted)', margin: '4px 0' }}>
                            {doctorMap[String(appointment.doctorId)]?.specialty || 'Consulta médica'}
                          </p>
                          <p style={{ fontSize: '0.85rem' }}>
                            {formatDateLabel(appointment.dateKey)} · {appointment.time}
                          </p>
                          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="sy-btn sy-btn--outline"
                              style={{ padding: '6px 12px' }}
                              onClick={() => handleReschedule(appointment)}
                            >
                              Reagendar
                            </button>
                            <button
                              type="button"
                              className="sy-btn sy-btn--ghost"
                              style={{ padding: '6px 12px', color: 'var(--sy-danger)' }}
                              onClick={() => handleCancelAppointment(appointment.id)}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                        <span className="sy-pill-green" style={{ alignSelf: 'flex-start' }}>
                          {appointment.id === nextAppointment.id ? 'Próxima' : 'Programada'}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h2>No hay citas próximas</h2>
                  <p style={{ color: 'var(--sy-text-muted)' }}>
                    Reserva tu próxima consulta y monitorea tu salud directamente desde el panel.
                  </p>
                </>
              )}
              </div>
              <div style={{ background: '#dbeafe', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: 16 }}>
                <button
                  type="button"
                  className="sy-btn sy-btn--ghost"
                  style={{ color: '#b45309' }}
                  onClick={() => navigate('/book')}
                >
                  {nextAppointment ? 'Reprogramar' : 'Agendar cita'}
                </button>
              </div>
            </article>

            <section className="sy-prescriptions">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Recetas recientes</h3>
                <button
                  type="button"
                  className="sy-portal__link-btn"
                  style={{ color: 'var(--sy-teal)', fontWeight: 600 }}
                  onClick={() => setShowAllRx((v) => !v)}
                >
                  {showAllRx ? 'Ver menos' : 'Ver todas'}
                </button>
              </div>
              <div className="sy-prescription-grid">
                {prescriptions.map((rx) => (
                  <div key={rx.name} className="sy-rx-card">
                    <span className={`sy-rx-badge ${rx.status === 'done' ? 'sy-rx-badge--done' : ''}`}>
                      {rx.status === 'active' ? 'ACTIVA' : 'COMPLETADA'}
                    </span>
                    <h4 style={{ margin: '12px 0 4px' }}>{rx.name}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--sy-text-muted)' }}>{rx.dose}</p>
                    <p style={{ fontSize: '0.8rem', marginTop: 12 }}>{rx.footer}</p>
                    {rx.status === 'active' && (
                      <button
                        type="button"
                        className="sy-btn sy-btn--ghost"
                        style={{ marginTop: 8, padding: 0 }}
                        disabled={isPending(rx.name)}
                        onClick={() => handleRenew(rx.name)}
                      >
                        {isPending(rx.name) ? 'Solicitud pendiente' : 'Renovar'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside>
            <div className="sy-health-card">
              <h3>Resumen de salud</h3>
              <div className="sy-metric">
                <span>Frecuencia cardíaca</span>
                <strong>72 lpm</strong>
              </div>
              <div className="sy-metric">
                <span>Presión arterial</span>
                <strong>120/80 mmHg</strong>
              </div>
              <div className="sy-metric" style={{ border: 'none' }}>
                <span>Peso</span>
                <strong>74,5 kg</strong>
              </div>
              <button
                type="button"
                className="sy-btn sy-btn--outline sy-btn--block"
                style={{ marginTop: 16 }}
                onClick={handleHealthReport}
              >
                Informe completo
              </button>
            </div>
            <div className="sy-tip-card">
              <strong style={{ fontSize: '0.7rem', letterSpacing: '0.08em' }}>CONSEJO DE BIENESTAR</strong>
              <p style={{ marginTop: 8, fontSize: '0.9rem' }}>
                ¡Mantente hidratado! Intenta beber 8 vasos de agua hoy.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <AppFooter />
    </div>
  )
}
