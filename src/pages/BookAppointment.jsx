import 'react-calendar/dist/Calendar.css'

import { es } from 'date-fns/locale'
import { useEffect, useMemo, useState } from 'react'
import Calendar from 'react-calendar'
import { useLocation, useNavigate } from 'react-router-dom'

import TimeSlotGroup from '../components/booking/TimeSlotGroup'
import AppFooter from '../components/layout/AppFooter'
import AppNavbar from '../components/layout/AppNavbar'
import { useAuth } from '../hooks'
import adminUsersService from '../services/adminUsersService'
import { isSlotInPast, useAppointmentsBookingStore } from '../store/appointmentsBookingStore'
import { useUsersAdminStore } from '../store/usersAdminStore'
import { formatDateLabel, getDisabledReason, getScheduleForDate, isDateBookable } from '../utils/bookingSchedule'
import { isColombianHoliday, isSunday, toDateKey } from '../utils/colombianHolidays'

function parseDateKey(dateKey) {
  const parts = dateKey?.split('-')
  if (!parts || parts.length !== 3) return null
  const [year, month, day] = parts.map(Number)
  return new Date(year, month - 1, day)
}

function firstAvailableSlot(doctorId, date, schedule, isSlotBooked) {
  const dateKey = toDateKey(date)
  const all = [...schedule.morning, ...schedule.afternoon]
  return all.find(
    (time) => !isSlotBooked(doctorId, dateKey, time) && !isSlotInPast(date, time),
  ) ?? null
}

export default function BookAppointment() {
  const navigate = useNavigate()
  const location = useLocation()
  const rescheduleAppointment = location.state?.rescheduleAppointment
  const { user } = useAuth()
  const isSlotBooked = useAppointmentsBookingStore((s) => s.isSlotBooked)
  const addBooking = useAppointmentsBookingStore((s) => s.addBooking)
  const removeBooking = useAppointmentsBookingStore((s) => s.removeBooking)
  const users = useUsersAdminStore((s) => s.users)
  const setUsers = useUsersAdminStore((s) => s.setUsers)
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [loadDoctorsError, setLoadDoctorsError] = useState('')

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoadingDoctors(true)
      setLoadDoctorsError('')
      try {
        const result = await adminUsersService.list()
        if (!mounted) return
        if (Array.isArray(result)) {
          setUsers(result)
        } else if (Array.isArray(result?.data)) {
          setUsers(result.data)
        } else {
          setUsers([])
        }
      } catch (error) {
        console.error('No se pudieron cargar los especialistas', error)
        if (mounted) {
          setLoadDoctorsError('No se pudieron cargar los especialistas. Intente de nuevo más tarde.')
        }
      } finally {
        if (mounted) setLoadingDoctors(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [setUsers])

  const doctors = useMemo(
    () =>
      users
        .filter((u) => (u.role || '').toLowerCase() === 'doctor')
        .sort((a, b) => {
          const order = { active: 0, pending: 1, suspended: 2 }
          return (order[a.status] ?? 3) - (order[b.status] ?? 3)
        }),
    [users],
  )

  const getInitialSelectedDate = () => {
    if (rescheduleAppointment?.dateKey) {
      const parsed = parseDateKey(rescheduleAppointment.dateKey)
      if (parsed && isDateBookable(parsed)) return parsed
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const cursor = new Date(today)
    for (let i = 0; i < 60; i += 1) {
      if (isDateBookable(cursor)) return cursor
      cursor.setDate(cursor.getDate() + 1)
    }
    return today
  }

  const initialSelectedDate = getInitialSelectedDate()

  const [selectedDoctorId, setSelectedDoctorId] = useState(() =>
    rescheduleAppointment?.doctorId != null ? String(rescheduleAppointment.doctorId) : null,
  )
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate)
  const [selectedTime, setSelectedTime] = useState(() => rescheduleAppointment?.time ?? null)
  const [showAllDoctors, setShowAllDoctors] = useState(false)
  const [confirmError, setConfirmError] = useState('')
  const [confirmSuccess, setConfirmSuccess] = useState('')
  const schedule = useMemo(() => getScheduleForDate(selectedDate), [selectedDate])

  const resolvedDoctorId = useMemo(() => {
    if (!doctors.length) return ''
    if (selectedDoctorId && doctors.some((d) => String(d.id) === String(selectedDoctorId))) {
      return String(selectedDoctorId)
    }
    const firstActive = doctors.find((d) => d.status === 'active') ?? doctors[0]
    return firstActive ? String(firstActive.id) : ''
  }, [doctors, selectedDoctorId])

  const resolvedTime = useMemo(() => {
    if (selectedTime != null) return selectedTime
    if (!resolvedDoctorId) return null
    return firstAvailableSlot(resolvedDoctorId, selectedDate, schedule, isSlotBooked)
  }, [selectedTime, resolvedDoctorId, selectedDate, schedule, isSlotBooked])

  const doctor = doctors.find((d) => String(d.id) === String(resolvedDoctorId))
  const dateKey = toDateKey(selectedDate)

  const isSlotDisabled = (time) =>
    isSlotBooked(resolvedDoctorId, dateKey, time) || isSlotInPast(selectedDate, time)

  const handleDoctorChange = (id) => {
    setSelectedDoctorId(String(id))
    const available = firstAvailableSlot(id, selectedDate, schedule, isSlotBooked)
    setSelectedTime(available)
    setConfirmError('')
    setConfirmSuccess('')
  }

  const handleDateChange = (value) => {
    const date = value instanceof Date ? value : value[0]
    if (!date || !isDateBookable(date)) return
    setSelectedDate(date)
    const updatedSchedule = getScheduleForDate(date)
    const available = firstAvailableSlot(resolvedDoctorId, date, updatedSchedule, isSlotBooked)
    setSelectedTime(available)
    setConfirmError('')
    setConfirmSuccess('')
  }

  const doctorsToShow = useMemo(() => {
    if (showAllDoctors) return doctors

    const visibleDoctors = doctors.slice(0, 4)
    if (!resolvedDoctorId) return visibleDoctors

    const selectedDoctorInView = visibleDoctors.some((doc) => String(doc.id) === String(resolvedDoctorId))
    if (selectedDoctorInView) return visibleDoctors

    const selectedDoctorEntry = doctors.find((doc) => String(doc.id) === String(resolvedDoctorId))
    return selectedDoctorEntry ? [...visibleDoctors, selectedDoctorEntry] : visibleDoctors
  }, [doctors, resolvedDoctorId, showAllDoctors])

  const hasMoreDoctors = doctors.length > doctorsToShow.length

  const tileDisabled = ({ date, view }) => {
    if (view !== 'month') return false
    return !isDateBookable(date)
  }

  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null
    if (isSunday(date)) return 'sy-cal-tile--sunday'
    if (isColombianHoliday(date)) return 'sy-cal-tile--holiday'
    if (!isDateBookable(date)) return 'sy-cal-tile--disabled'
    return null
  }

  const handleConfirm = () => {
    if (!doctors.length) {
      setConfirmError('No hay profesionales disponibles para agendar en este momento.')
      return
    }
    setConfirmError('')
    setConfirmSuccess('')

    if (!resolvedTime) {
      setConfirmError('Seleccione un horario disponible.')
      return
    }

    if (!doctor || doctor.status !== 'active') {
      setConfirmError('Seleccione un especialista activo para agendar la cita.')
      return
    }

    if (isSlotDisabled(resolvedTime)) {
      setConfirmError('Este horario no está disponible. Elija otra franja.')
      return
    }

    const isSameSlotAsOriginal =
      rescheduleAppointment?.id &&
      String(rescheduleAppointment.doctorId) === String(resolvedDoctorId) &&
      rescheduleAppointment.dateKey === dateKey &&
      rescheduleAppointment.time === resolvedTime

    if (isSameSlotAsOriginal) {
      setConfirmSuccess('¡Cita reprogramada! La cita permanece en el mismo horario.')
      navigate('/dashboard')
      return
    }

    const result = addBooking({
      doctorId: resolvedDoctorId,
      dateKey,
      time: resolvedTime,
      patientName: user?.nombreCompleto || 'Paciente',
      patientEmail: user?.email || '',
    })

    if (!result.success) {
      setConfirmError(result.error)
      return
    }

    if (rescheduleAppointment?.id) {
      removeBooking(rescheduleAppointment.id)
      setConfirmSuccess('¡Cita reprogramada! La nueva cita está confirmada.')
    } else {
      setConfirmSuccess('¡Cita confirmada! El horario quedó reservado para este profesional.')
    }

    navigate('/dashboard')
  }

  const checkSlotBooked = (time) => isSlotBooked(resolvedDoctorId, dateKey, time)
  const checkSlotPast = (time) => isSlotInPast(selectedDate, time)

  return (
    <div className="sy-page sy-page--gray">
      <AppNavbar />

      <main className="sy-app-main">
        <header className="sy-page-header">
          <h1>{rescheduleAppointment ? 'Reprograma tu cita' : 'Reserva tu cita'}</h1>
          <p>
            Agenda de lunes a viernes: 8:00 a. m. – 12:00 m. y 1:00 p. m. – 5:00 p. m. Sábados solo
            mañana (8:00 a. m. – 12:00 m.). Domingos sin disponibilidad.
          </p>
          {rescheduleAppointment && (
            <p style={{ marginTop: 12, color: 'var(--sy-text-muted)' }}>
              Estás reprogramando la cita con {doctor?.name || 'tu especialista'} para {formatDateLabel(parseDateKey(rescheduleAppointment.dateKey))} a las {rescheduleAppointment.time}.
            </p>
          )}
        </header>

        <div className="sy-booking">
          <div>
            <section className="sy-booking-step">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span>1. Elige a tu especialista</span>
                {doctors.length > 4 && (
                  <button
                    type="button"
                    className="sy-badge sy-badge--clickable"
                    style={{ fontSize: '0.65rem' }}
                    onClick={() => setShowAllDoctors((prev) => !prev)}
                    aria-pressed={showAllDoctors}
                  >
                    {showAllDoctors ? 'Ocultar lista' : 'Lista completa'}
                  </button>
                )}
              </h3>
              <p className="sy-field-hint" style={{ margin: '0 0 12px' }}>
                {doctors.length > 4 && !showAllDoctors
                  ? 'Se muestran los primeros 4 especialistas. Usa Lista completa para ver al resto de profesionales.'
                  : 'Se muestran todos los especialistas registrados. Los médicos inactivos aparecen deshabilitados y los pendientes pueden ser aprobados por el administrador.'}
              </p>
              <div className="sy-doctor-list">
                {loadingDoctors ? (
                  <p style={{ padding: 20, color: 'var(--sy-text-muted)' }}>
                    Cargando especialistas...
                  </p>
                ) : loadDoctorsError ? (
                  <p style={{ padding: 20, color: 'var(--sy-danger)' }}>{loadDoctorsError}</p>
                ) : doctors.length === 0 ? (
                  <p style={{ padding: 20, color: 'var(--sy-text-muted)' }}>
                    No hay profesionales habilitados para agendar citas. Pide a un administrador que active algún doctor.
                  </p>
                ) : (
                  doctorsToShow.map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      className={`sy-doctor-card ${String(resolvedDoctorId) === String(doc.id) ? 'is-selected' : ''}`}
                      onClick={() => handleDoctorChange(doc.id)}
                      disabled={doc.status !== 'active'}
                    >
                      <div className="sy-avatar sy-avatar--lg" aria-hidden />
                      <div style={{ textAlign: 'left' }}>
                        <strong>{doc.name}</strong>
                        <p style={{ margin: '4px 0', color: 'var(--sy-text-muted)', fontSize: '0.9rem' }}>
                          {doc.specialty || 'Especialidad no especificada'}
                        </p>
                        {doc.status === 'active' ? (
                          <span style={{ fontSize: '0.85rem' }}>★ {doc.rating || 'N/A'}</span>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: 'var(--sy-text-muted)' }}>
                            {doc.status === 'pending' ? 'Pendiente de aprobación' : 'No disponible'}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
              {hasMoreDoctors && (
                <button
                  type="button"
                  className="sy-btn sy-btn--ghost"
                  style={{ marginTop: 12 }}
                  onClick={() => setShowAllDoctors((prev) => !prev)}
                >
                  {showAllDoctors ? 'Mostrar menos doctores' : `Mostrar más doctores (${doctors.length - doctorsToShow.length} más)`}
                </button>
              )}
            </section>

            <section className="sy-booking-step">
              <h3>2. Selecciona la fecha</h3>
              <div className="sy-booking-calendar-wrap">
                <Calendar
                  onChange={handleDateChange}
                  value={selectedDate}
                  locale={es}
                  minDate={new Date()}
                  tileDisabled={tileDisabled}
                  tileClassName={tileClassName}
                />
              </div>
              <p className="sy-booking-calendar-legend">
                <span className="sy-legend-dot sy-legend-dot--ok" /> Disponible
                <span className="sy-legend-dot sy-legend-dot--busy" /> No disponible (ocupada)
                <span className="sy-legend-dot sy-legend-dot--off" /> Domingo
                <span className="sy-legend-dot sy-legend-dot--holiday" /> Festivo
              </p>
              {schedule.reason && (
                <p className="sy-field-hint" style={{ color: 'var(--sy-danger)' }}>
                  {schedule.reason}
                </p>
              )}
            </section>
          </div>

          <aside>
            <section className="sy-booking-step">
              <h3>3. Elige la hora</h3>

              <TimeSlotGroup
                title="MAÑANA (8:00 a. m. – 12:00 m.)"
                times={schedule.morning}
                selectedTime={resolvedTime}
                isSlotBooked={checkSlotBooked}
                isSlotPast={checkSlotPast}
                onSelectTime={setSelectedTime}
              />

              <TimeSlotGroup
                title="TARDE (1:00 p. m. – 5:00 p. m.)"
                times={schedule.afternoon}
                selectedTime={resolvedTime}
                isSlotBooked={checkSlotBooked}
                isSlotPast={checkSlotPast}
                onSelectTime={setSelectedTime}
              />

              {schedule.morning.length === 0 && schedule.afternoon.length === 0 && (
                <p style={{ color: 'var(--sy-text-muted)' }}>
                  {getDisabledReason(selectedDate) || 'No hay horarios para este día.'}
                </p>
              )}

              <h4 style={{ marginTop: 20, fontSize: '0.75rem', color: 'var(--sy-text-muted)' }}>
                RESUMEN DE LA CITA
              </h4>
              <div className="sy-summary-box">
                <p>
                  {formatDateLabel(selectedDate)}
                  {resolvedTime ? ` • ${resolvedTime}` : ' • Sin hora'}
                </p>
                <strong>{doctor?.name || 'Profesional no seleccionado'}</strong>
                {doctor?.specialty && <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--sy-text-muted)' }}>{doctor.specialty}</p>}
              </div>

              {confirmError && (
                <p className="sy-booking-alert sy-booking-alert--error">{confirmError}</p>
              )}
              {confirmSuccess && (
                <p className="sy-booking-alert sy-booking-alert--ok">{confirmSuccess}</p>
              )}

              <button
                type="button"
                className="sy-btn sy-btn--primary sy-btn--block sy-btn--lg"
                onClick={handleConfirm}
                disabled={!resolvedTime || isSlotDisabled(resolvedTime)}
              >
                Confirmar cita
              </button>
              <p className="sy-booking-slots-legend">
                <span className="sy-legend-swatch sy-legend-swatch--available" /> Seleccionable
                <span className="sy-legend-swatch sy-legend-swatch--busy" /> No disponible (solo lectura)
              </p>
              <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--sy-text-muted)', marginTop: 12 }}>
                No se requiere pago hasta la visita.
              </p>
            </section>
          </aside>
        </div>

        <div className="sy-info-cards">
          <div className="sy-info-card sy-info-card--blue">
            <strong>Seguro cubierto</strong>
            <p>Se aceptan la mayoría de los principales proveedores de seguros para la consulta de este especialista.</p>
          </div>
          <div className="sy-info-card sy-info-card--green">
            <strong>Política de cancelación</strong>
            <p>Cancelaciones gratuitas hasta 24 horas antes de su cita programada.</p>
          </div>
          <div className="sy-info-card sy-info-card--gray">
            <strong>Preparación</strong>
            <p>Por favor, traiga su identificación y los informes de su historial médico previo a la clínica.</p>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  )
}
