import { useEffect, useMemo, useState } from 'react'

import { useAuth } from '../hooks'
import appointmentsService from '../services/appointmentsService'
import availabilityService from '../services/availabilityService'
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
  const doctorId = user?.id ?? currentDoctor?.id ?? null

  const [appointments, setAppointments] = useState([])

  const [baseSlots, setBaseSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [slotsError, setSlotsError] = useState('')

  const doctorBookings = useMemo(
    () => {
      if (!doctorId) return []

      return appointments
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

  const sortedBookings = useMemo(
    () => doctorBookings.slice().sort(sortByDateTime),
    [doctorBookings],
  )

  useEffect(() => {
    let mounted = true

    const loadAppointments = async () => {
      try {
        const data = await appointmentsService.getAllAppointments()
        if (!mounted) return
        setAppointments(Array.isArray(data) ? data : [])
      } catch (error) {
        if (!mounted) return
        console.error('No se pudieron cargar las citas del médico', error)
      }
    }

    loadAppointments()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true
    if (!doctorId || typeof doctorId !== 'number') return

    const load = async () => {
      setLoadingSlots(true)
      setSlotsError('')
      try {
        const slots = await availabilityService.getDoctorBaseAvailability(doctorId)
        if (!mounted) return
        setBaseSlots(slots)
      // eslint-disable-next-line no-unused-vars
      } catch (_error) {
        if (!mounted) return
        setSlotsError('No se pudo cargar la disponibilidad del médico.')
      } finally {
        if (mounted) setLoadingSlots(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [doctorId])

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
        {loadingSlots && <p>Cargando disponibilidad...</p>}
        {!loadingSlots && slotsError && (
          <p style={{ color: 'var(--sy-danger)' }}>{slotsError}</p>
        )}
        {!loadingSlots && !slotsError && baseSlots.length === 0 && (
          <p>No hay bloques de disponibilidad configurados para este médico.</p>
        )}
        {!loadingSlots && !slotsError && baseSlots.length > 0 && (
          <ul className="sy-table" style={{ listStyle: 'none', padding: 0 }}>
            {baseSlots.map((slot) => (
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
                  <strong>Día {slot.dayOfWeek}</strong> · {slot.startTime} – {slot.endTime}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
