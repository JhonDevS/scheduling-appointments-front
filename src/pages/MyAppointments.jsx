import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import AppFooter from '../components/layout/AppFooter'
import AppNavbar from '../components/layout/AppNavbar'
import { useAuth } from '../hooks'
import { useAppointmentsBookingStore } from '../store/appointmentsBookingStore'
import { useUsersAdminStore } from '../store/usersAdminStore'
import { buildAppointmentsHistoryText, filterAppointmentsByTab } from '../utils/appointmentsFilter'
import { parseTime12h } from '../utils/bookingSchedule'
import { parseDateKey, getTodayKey } from '../utils/colombianHolidays'
import { downloadTextFile } from '../utils/downloadFile'

const STATUS_LABEL = {
  confirmed: { text: 'Confirmada', className: 'sy-status-dot--ok' },
  pending: { text: 'Pendiente', className: 'sy-status-dot--pending' },
  completed: { text: 'Completada', className: 'sy-status-dot--ok' },
  cancelled: { text: 'Cancelada', className: 'sy-status-dot--cancel' },
  finalizada: { text: 'Finalizada', className: 'sy-status-dot--ok' },
  atendida: { text: 'Atendida', className: 'sy-status-dot--ok' },
}

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

export default function MyAppointments() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const appointments = useAppointmentsBookingStore((s) => s.bookings)
  const updateBooking = useAppointmentsBookingStore((s) => s.updateBooking)
  const doctors = useUsersAdminStore((s) => s.users)
  const [tab, setTab] = useState('upcoming')
  const [showFullHistory, setShowFullHistory] = useState(false)
  const [actionMessage, setActionMessage] = useState('')

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
    return appointments
      .filter((item) => item.patientEmail === userEmail)
      .sort(sortAppointmentsByDateTime)
  }, [appointments, userEmail])

  const todayKey = getTodayKey()
  const patientSchedule = useMemo(
    () =>
      patientAppointments.map((item) => {
        const status = item.status || (item.dateKey >= todayKey ? 'confirmed' : 'completed')
        return {
          ...item,
          name: doctorMap[String(item.doctorId)]?.name || 'Especialista SaludYa',
          specialty: doctorMap[String(item.doctorId)]?.specialty || 'Consulta médica',
          date: formatDateLabel(item.dateKey),
          status,
        }
      }),
    [patientAppointments, todayKey, doctorMap],
  )

  const filteredSchedule = useMemo(() => filterAppointmentsByTab(patientSchedule, tab), [tab, patientSchedule])
  const displaySchedule = showFullHistory ? patientSchedule : filteredSchedule
  const nextAppointment = patientSchedule.find((item) => item.status === 'confirmed')

  const summaryCounts = useMemo(
    () =>
      patientSchedule.reduce(
        (acc, item) => {
          const statusKey = item.status === 'finalizada' || item.status === 'atendida' ? 'completed' : item.status
          acc[statusKey] = (acc[statusKey] || 0) + 1
          return acc
        },
        { confirmed: 0, completed: 0, cancelled: 0, pending: 0 },
      ),
    [patientSchedule],
  )

  const handleCancelAppointment = (bookingId) => {
    updateBooking(bookingId, { status: 'cancelled' })
    setActionMessage('Tu cita ha sido cancelada correctamente.')
  }

  const handleReschedule = (appointment) => {
    setActionMessage('Redirigiendo al formulario para reprogramar tu cita...')
    navigate('/book', { state: { rescheduleAppointment: appointment } })
  }

  const handleDownloadPdf = () => {
    const content = buildAppointmentsHistoryText(patientSchedule)
    downloadTextFile('historial-citas-saludya.txt', content)
  }

  return (
    <div className="sy-page sy-page--gray">
      <AppNavbar />

      <main className="sy-app-main">
        <div className="sy-page-header-row">
          <header className="sy-page-header">
            <span className="sy-kicker">Santuario del paciente</span>
            <h1>Mis citas</h1>
            <p>
              Gestione su trayectoria de salud con facilidad. Vea las próximas consultas, revise las visitas
              pasadas o reprograme su atención.
            </p>
          </header>
          <button type="button" className="sy-btn sy-btn--primary sy-btn--lg" onClick={() => navigate('/book')}>
            + Reservar nueva cita
          </button>
        </div>

        <div className="sy-appt-grid">
          <div className="sy-appt-featured">
            <span className="sy-badge-pill">Próxima</span>
            <span style={{ marginLeft: 12, opacity: 0.9 }}>
              {nextAppointment ? `Próxima en ${nextAppointment.date}` : 'No hay citas reservadas'}
            </span>
            <h2 style={{ margin: '16px 0 4px' }}>
              {nextAppointment?.name || 'Sin agenda disponible'}
            </h2>
            <p style={{ opacity: 0.85 }}>{nextAppointment?.specialty || 'Reserva una cita para ver tus resultados'}</p>
            {nextAppointment ? (
              <div style={{ display: 'flex', gap: 32, marginTop: 28 }}>
                <div>
                  <small style={{ opacity: 0.7 }}>FECHA</small>
                  <p>{nextAppointment.date}</p>
                </div>
                <div>
                  <small style={{ opacity: 0.7 }}>HORA</small>
                  <p>{nextAppointment.time}</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="sy-stats-card">
            <h3>Resumen de actividad</h3>
            <div className="sy-stat-row">
              <span>Confirmadas</span>
              <strong>{summaryCounts.confirmed}</strong>
            </div>
            <div className="sy-stat-row">
              <span>Completadas</span>
              <strong>{summaryCounts.completed}</strong>
            </div>
            <div className="sy-stat-row" style={{ border: 'none' }}>
              <span>Canceladas</span>
              <strong>{summaryCounts.cancelled}</strong>
            </div>
            <button
              type="button"
              className="sy-portal__link-btn"
              style={{ color: 'var(--sy-teal)', fontWeight: 600, fontSize: '0.9rem', padding: 0 }}
              onClick={handleDownloadPdf}
            >
              Descargar historial en PDF
            </button>
          </div>
        </div>

        <div className="sy-schedule-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3>Horario reciente</h3>
            <div className="sy-tabs">
              <button type="button" className={tab === 'upcoming' ? 'is-active' : ''} onClick={() => setTab('upcoming')}>
                Próximas
              </button>
              <button type="button" className={tab === 'past' ? 'is-active' : ''} onClick={() => setTab('past')}>
                Visitas pasadas
              </button>
            </div>
          </div>
          {actionMessage && (
            <p style={{ color: 'var(--sy-teal)', marginBottom: 16 }}>{actionMessage}</p>
          )}

          {displaySchedule.length === 0 ? (
            <p style={{ color: 'var(--sy-text-muted)' }}>
              {patientSchedule.length === 0
                ? 'Aún no tienes citas registradas. Reserva una para comenzar.'
                : 'No hay citas en esta categoría.'}
            </p>
          ) : (
            displaySchedule.map((item) => (
              <div key={`${item.id}-${item.date}`} className="sy-appt-row">
                <div className="sy-avatar" aria-hidden />
                <div style={{ flex: 1 }}>
                  <strong>{item.name}</strong>
                  <p style={{ color: 'var(--sy-text-muted)', fontSize: '0.9rem' }}>{item.specialty}</p>
                  <p style={{ fontSize: '0.85rem', marginTop: 4 }}>
                    {item.date} · {item.time}
                  </p>
                </div>
                <span className={`sy-status-dot ${STATUS_LABEL[item.status]?.className || 'sy-status-dot--ok'}`}>
                  ● {STATUS_LABEL[item.status]?.text || 'Programada'}
                </span>
                {(item.status === 'confirmed' || item.status === 'pending') && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="sy-btn sy-btn--outline"
                      style={{ padding: '6px 12px' }}
                      onClick={() => handleReschedule(item)}
                    >
                      Reagendar
                    </button>
                    <button
                      type="button"
                      className="sy-btn sy-btn--ghost"
                      style={{ padding: '6px 12px', color: 'var(--sy-danger)' }}
                      onClick={() => handleCancelAppointment(item.id)}
                    >
                      Cancelar
                    </button>
                  </div>
                )}
                {item.status === 'cancelled' && (
                  <button type="button" className="sy-btn sy-btn--outline" onClick={() => navigate('/book')}>
                    Volver a reservar
                  </button>
                )}
                {(item.status === 'finalizada' || item.status === 'atendida') && (
                  <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 12, background: '#f3f4f6' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '0.9rem' }}><strong>Diagnóstico:</strong> {item.diagnosis || 'No registrado'}</p>
                    <p style={{ margin: '0 0 8px', fontSize: '0.9rem' }}><strong>Receta:</strong> {item.prescription || 'No registrada'}</p>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Observaciones:</strong> {item.observations || 'No hay observaciones'}</p>
                  </div>
                )}
              </div>
            ))
          )}

          <p style={{ textAlign: 'center', marginTop: 24 }}>
            <button
              type="button"
              className="sy-portal__link-btn"
              style={{ color: 'var(--sy-teal)', fontWeight: 600 }}
              onClick={() => setShowFullHistory((v) => !v)}
            >
              {showFullHistory ? 'Ver vista filtrada' : 'Ver historial completo →'}
            </button>
          </p>
        </div>
      </main>

      <AppFooter />
    </div>
  )
}
