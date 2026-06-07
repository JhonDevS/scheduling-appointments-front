/* eslint-disable react-hooks/preserve-manual-memoization */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'

import { useAuth } from '../hooks'
import appointmentsService from '../services/appointmentsService'
import { useUsersAdminStore } from '../store/usersAdminStore'
import { getDateInTimeZone, toDateKey } from '../utils/colombianHolidays'
import { filterBySearch } from '../utils/doctorSchedule'

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const { searchQuery = '' } = useOutletContext() ?? {}
  const { user } = useAuth()
  const doctors = useUsersAdminStore((s) => s.users)

  const [scheduleView, setScheduleView] = useState('day')
  const [dateTab, setDateTab] = useState('today')
  const [showAllPatients, setShowAllPatients] = useState(false)
  const [appointments, setAppointments] = useState([])

  const currentDoctor = useMemo(
    () => doctors.find((doc) => doc.role === 'doctor' && doc.email?.toLowerCase() === user?.email?.toLowerCase()),
    [doctors, user?.email],
  )

  const doctorId = user?.id ?? currentDoctor?.id ?? null
  const doctorName = currentDoctor?.name ?? user?.nombreCompleto ?? 'el doctor'

  const today = getDateInTimeZone(new Date())
  const tomorrow = new Date(today)
  const dayAfterTomorrow = new Date(today)
  const weekEnd = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  dayAfterTomorrow.setDate(today.getDate() + 2)
  weekEnd.setDate(today.getDate() + 6)

  const todayKey = toDateKey(today)
  const tomorrowKey = toDateKey(tomorrow)
  const dayAfterTomorrowKey = toDateKey(dayAfterTomorrow)
  const weekEndKey = toDateKey(weekEnd)

  const dateTabs = [
    { id: 'today', label: `Hoy, ${today.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}` },
    { id: 'tomorrow', label: `Mañana, ${tomorrow.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}` },
    { id: 'dayAfterTomorrow', label: `Pasado mañana, ${dayAfterTomorrow.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}` },
  ]

  const appointmentsForDoctor = useMemo(
    () => {
      if (!doctorId) return []

      // El backend ya filtra por alcance cuando el rol es doctor.
      // Aun así, filtramos por doctorId por seguridad para escenarios de admin.
      return appointments
        .filter((apt) => apt.doctorId == null || Number(apt.doctorId) === Number(doctorId))
        .map((apt) => {
          const start = new Date(apt.start)
          const dateKey = start.toISOString().slice(0, 10)
          const time = start.toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })

          return {
            id: apt.id,
            dateKey,
            time,
            patientName: apt.patientName || 'Paciente',
            patientEmail: apt.patientEmail || '',
          }
        })
    },
    [appointments, doctorId],
  )

  const todayBookings = useMemo(
    () => appointmentsForDoctor.filter((booking) => booking.dateKey === todayKey),
    [appointmentsForDoctor, todayKey],
  )

  const tomorrowBookings = useMemo(
    () => appointmentsForDoctor.filter((booking) => booking.dateKey === tomorrowKey),
    [appointmentsForDoctor, tomorrowKey],
  )

  const dayAfterTomorrowBookings = useMemo(
    () => appointmentsForDoctor.filter((booking) => booking.dateKey === dayAfterTomorrowKey),
    [appointmentsForDoctor, dayAfterTomorrowKey],
  )

  const weeklyBookings = useMemo(
    () =>
      appointmentsForDoctor
        .filter((booking) => booking.dateKey >= todayKey && booking.dateKey <= weekEndKey)
        .sort((a, b) => {
          if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey)
          return a.time.localeCompare(b.time)
        }),
    [appointmentsForDoctor, todayKey, weekEndKey],
  )

  const tabBookings = useMemo(
    () => ({
      today: todayBookings,
      tomorrow: tomorrowBookings,
      dayAfterTomorrow: dayAfterTomorrowBookings,
    }),
    [todayBookings, tomorrowBookings, dayAfterTomorrowBookings],
  )

  const visibleBookings = scheduleView === 'week' ? weeklyBookings : tabBookings[dateTab]

  const filteredTimeline = filterBySearch(
    visibleBookings,
    searchQuery,
    ['patientName', 'patientEmail', 'time'],
  ).map((booking) => ({
    time: booking.time,
    patient: booking.patientName,
    detail: `${booking.patientEmail} • ${booking.dateKey}`,
    badge: 'CONFIRMADO',
    variant: 'ok',
    dateKey: booking.dateKey,
  }))

  const nextAppointment = weeklyBookings[0]
  const upcomingPatients = useMemo(
    () => weeklyBookings.slice(0, 3).map((booking) => ({
      name: booking.patientName,
      note: booking.dateKey === todayKey
        ? `Cita hoy • ${booking.time}`
        : booking.dateKey === tomorrowKey
        ? `Mañana • ${booking.time}`
        : `Próximo • ${booking.time}`,
    })),
    [weeklyBookings, todayKey, tomorrowKey],
  )

  const patientsToShow = showAllPatients ? upcomingPatients : upcomingPatients.slice(0, 2)

  const weekRangeLabel = `${today.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} - ${weekEnd.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}`

  useEffect(() => {
    let mounted = true

    const loadAppointments = async () => {

      try {
        const data = await appointmentsService.getAllAppointments()
        if (!mounted) return
        setAppointments(Array.isArray(data) ? data : [])
      } catch (error) {
        if (!mounted) return
        console.error('No se pudieron cargar las citas del médico para el dashboard', error)
      }
    }

    loadAppointments()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 8px' }}>Buenos días, {doctorName}.</h1>
          <p style={{ color: 'var(--sy-text-muted)', maxWidth: 560 }}>
            Tienes {weeklyBookings.length} citas programadas para esta semana. Cambia a la vista de Semana para ver todos los pacientes y turnos.
          </p>
        </div>
          <div className="sy-portal-stats">
            <div className="sy-stat-mini">
              <span>TOTAL DE CITAS</span>
              <strong>{appointmentsForDoctor.length}</strong>
              <small style={{ color: 'var(--sy-success)' }}>{todayBookings.length} hoy</small>
            </div>
            <div className="sy-stat-mini">
              <span>PRÓXIMA CITA</span>
              <strong>{nextAppointment ? `${nextAppointment.patientName || nextAppointment.patient} • ${nextAppointment.time}` : 'Sin citas'}</strong>
            </div>
          </div>
      </div>

      <div className="sy-portal-grid">
        <div className="sy-timeline">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>{scheduleView === 'day' ? 'Cronograma diario' : 'Cronograma semanal'}</h3>
            <div className="sy-tabs">
              <button
                type="button"
                className={scheduleView === 'day' ? 'is-active' : ''}
                onClick={() => setScheduleView('day')}
              >
                Día
              </button>
              <button
                type="button"
                className={scheduleView === 'week' ? 'is-active' : ''}
                onClick={() => setScheduleView('week')}
              >
                Semana
              </button>
            </div>
          </div>
          {scheduleView === 'day' ? (
            <div className="sy-date-tabs">
              {dateTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={dateTab === tab.id ? 'is-active' : ''}
                  onClick={() => setDateTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : (
            <p style={{ marginTop: 10, color: 'var(--sy-text-muted)' }}>
              Mostrando programación de la semana completa ({weekRangeLabel}).
            </p>
          )}
          {filteredTimeline.length === 0 ? (
            <p style={{ color: 'var(--sy-text-muted)' }}>No hay eventos que coincidan con la búsqueda.</p>
          ) : (
            filteredTimeline.map((item) => (
              <div key={`${item.time}-${item.patient}`} className="sy-timeline-item">
                <div>
                  <small style={{ color: 'var(--sy-text-muted)' }}>{item.time}</small>
                  <h4 style={{ margin: '4px 0' }}>{item.patient}</h4>
                  {item.detail && <p style={{ fontSize: '0.9rem', color: 'var(--sy-text-muted)' }}>{item.detail}</p>}
                  {item.badge && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: item.variant === 'urgent' ? '#0369a1' : 'var(--sy-success)',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <aside>
          <div className="sy-widget-teal" style={{ marginBottom: 20 }}>
            <h3 style={{ marginTop: 0 }}>Disponibilidad</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--sy-text-muted)' }}>
              Tu disponibilidad base es gestionada por el equipo administrador. Si necesitás cambios en tu
              horario, contactá a soporte o al área administrativa.
            </p>
            <button
              type="button"
              className="sy-btn sy-btn--white sy-btn--block"
              style={{ marginTop: 8 }}
              onClick={() => navigate('/doctor/calendar')}
            >
              Ver calendario de disponibilidad
            </button>
          </div>

          <div className="sy-stats-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3>Nuevos pacientes</h3>
              <button
                type="button"
                className="sy-portal__link-btn"
                style={{ color: 'var(--sy-teal)' }}
                onClick={() => setShowAllPatients((v) => !v)}
              >
                {showAllPatients ? 'Ver menos' : 'Ver todo'}
              </button>
            </div>
            {patientsToShow.map((p) => (
              <div key={p.name} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--sy-border)' }}>
                <div className="sy-avatar" aria-hidden />
                <div>
                  <strong>{p.name}</strong>
                  <p style={{ fontSize: '0.8rem', color: 'var(--sy-text-muted)' }}>{p.note}</p>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="sy-btn sy-btn--outline sy-btn--block"
              style={{ marginTop: 12 }}
              onClick={() => navigate('/doctor/calendar')}
            >
              Ir al calendario
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
