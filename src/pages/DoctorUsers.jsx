import { useMemo, useState } from 'react'

import { useAuth } from '../hooks'
import { useAppointmentsBookingStore } from '../store/appointmentsBookingStore'
import { useUsersAdminStore } from '../store/usersAdminStore'
import { parseTime12h } from '../utils/bookingSchedule'
import { parseDateKey } from '../utils/colombianHolidays'

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

export default function DoctorUsers() {
  const { user } = useAuth()
  const doctors = useUsersAdminStore((s) => s.users)
  const bookings = useAppointmentsBookingStore((s) => s.bookings)
  const updateBooking = useAppointmentsBookingStore((s) => s.updateBooking)

  const [activePatientEmail, setActivePatientEmail] = useState(null)
  const [draft, setDraft] = useState({ diagnosis: '', prescription: '', observations: '' })
  const [message, setMessage] = useState('')

  const currentDoctor = useMemo(
    () => doctors.find((doc) => doc.role === 'doctor' && doc.email?.toLowerCase() === user?.email?.toLowerCase()),
    [doctors, user?.email],
  )

  const doctorId = currentDoctor?.id ?? 'SY-2024-81'

  const doctorBookings = useMemo(
    () => bookings.filter((booking) => booking.doctorId === doctorId),
    [bookings, doctorId],
  )

  const patients = useMemo(() => {
    const map = new Map()

    doctorBookings.forEach((booking) => {
      const existing = map.get(booking.patientEmail)

      if (!existing) {
        map.set(booking.patientEmail, {
          name: booking.patientName,
          email: booking.patientEmail,
          lastVisit: booking.dateKey,
          appointments: 1,
          bookings: [booking],
        })
      } else {
        existing.appointments += 1
        existing.bookings.push(booking)
        if (booking.dateKey > existing.lastVisit) {
          existing.lastVisit = booking.dateKey
        }
      }
    })

    return Array.from(map.values())
  }, [doctorBookings])

  const activePatient = useMemo(
    () => patients.find((patient) => patient.email === activePatientEmail),
    [patients, activePatientEmail],
  )

  const getActiveBookingForPatient = (patient) => {
    if (!patient) return null

    const sorted = patient.bookings
      .slice()
      .sort((a, b) => {
        if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey)
        return (parseTime12h(a.time) || 0) - (parseTime12h(b.time) || 0)
      })

    const pending = sorted.filter((booking) => booking.status !== 'atendida' && booking.status !== 'cancelled')
    return pending.length > 0 ? pending[0] : sorted[0]
  }

  const activeBooking = useMemo(() => getActiveBookingForPatient(activePatient), [activePatient])

  const handleTogglePatient = (email) => {
    const nextEmail = activePatientEmail === email ? null : email
    setActivePatientEmail(nextEmail)
    setMessage('')

    if (nextEmail) {
      const selectedPatient = patients.find((patient) => patient.email === email)
      const booking = getActiveBookingForPatient(selectedPatient)
      setDraft({
        diagnosis: booking?.diagnosis || '',
        prescription: booking?.prescription || '',
        observations: booking?.observations || '',
      })
    }
  }

  const handleFinalize = () => {
    if (!activeBooking) {
      setMessage('No hay una cita activa para procesar.')
      return
    }

    updateBooking(activeBooking.id, {
      status: 'atendida',
      diagnosis: draft.diagnosis.trim(),
      prescription: draft.prescription.trim(),
      observations: draft.observations.trim(),
    })

    setMessage('Atención finalizada y guardada. La cita ahora figura como atendida.')
    setActivePatientEmail(null)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <span className="sy-kicker">Panel médico</span>
          <h1 style={{ margin: '8px 0' }}>Gestión de pacientes</h1>
          <p style={{ color: 'var(--sy-text-muted)', maxWidth: 620 }}>
            Lista de pacientes que han reservado citas con este doctor. Seleccione un paciente para ingresar diagnóstico, receta y observaciones.
          </p>
        </div>
        <div className="sy-stat-mini" style={{ minWidth: 180 }}>
          <span>Pacientes</span>
          <strong>{patients.length}</strong>
          <small>{doctorBookings.length} citas totales</small>
        </div>
      </div>

      {message && (
        <div style={{ marginTop: 18, padding: 14, borderRadius: 12, background: '#ecfdf5', color: '#065f46' }}>
          {message}
        </div>
      )}

      {patients.length === 0 ? (
        <p style={{ marginTop: 24, color: 'var(--sy-text-muted)' }}>
          No hay pacientes registrados para este doctor.
        </p>
      ) : (
        <div className="sy-table" style={{ marginTop: 24 }}>
          {patients.map((patient) => {
            const isActive = activePatientEmail === patient.email
            return (
              <div
                key={patient.email}
                className="sy-table-row"
                style={{ display: 'grid', gap: 10, padding: 18, borderBottom: '1px solid var(--sy-border)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <strong>{patient.name}</strong>
                    <p style={{ color: 'var(--sy-text-muted)', fontSize: '0.9rem' }}>{patient.email}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--sy-teal)', fontSize: '0.95rem', fontWeight: 700 }}>
                      {patient.appointments} cita{patient.appointments > 1 ? 's' : ''}
                    </span>
                    <button type="button" className="sy-btn sy-btn--outline" onClick={() => handleTogglePatient(patient.email)}>
                      {isActive ? 'Cerrar' : 'Atender'}
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <span>Última cita: {formatDate(patient.lastVisit)}</span>
                  <span style={{ color: 'var(--sy-teal)', fontWeight: 600 }}>Gestión</span>
                </div>

                {isActive && activePatient && (
                  <div style={{ padding: 18, borderRadius: 12, background: '#f9fafb', border: '1px solid var(--sy-border)', marginTop: 8 }}>
                    <div style={{ marginBottom: 18 }}>
                      <strong>Paciente</strong>
                      <p style={{ margin: '6px 0 0', color: 'var(--sy-text-muted)' }}>{patient.name}</p>
                      <p style={{ margin: '2px 0 0', color: 'var(--sy-text-muted)' }}>{patient.email}</p>
                    </div>

                    {activeBooking ? (
                      <>
                        <div style={{ marginBottom: 18 }}>
                          <strong>Cita seleccionada</strong>
                          <p style={{ margin: '6px 0 0', color: 'var(--sy-text-muted)' }}>
                            {formatDate(activeBooking.dateKey)} · {activeBooking.time}
                          </p>
                          <p style={{ margin: '2px 0 0', color: 'var(--sy-text-muted)' }}>
                            Estado: {activeBooking.status || 'confirmada'}
                          </p>
                        </div>

                        <label style={{ display: 'block', marginBottom: 14 }}>
                          <strong>Diagnóstico</strong>
                          <textarea
                            value={draft.diagnosis}
                            onChange={(event) => setDraft((prev) => ({ ...prev, diagnosis: event.target.value }))}
                            rows={4}
                            style={{ width: '100%', marginTop: 8, resize: 'vertical', borderRadius: 12, border: '1px solid rgba(0,0,0,0.12)', padding: 12 }}
                          />
                        </label>

                        <label style={{ display: 'block', marginBottom: 14 }}>
                          <strong>Receta / Medicamentos</strong>
                          <textarea
                            value={draft.prescription}
                            onChange={(event) => setDraft((prev) => ({ ...prev, prescription: event.target.value }))}
                            rows={3}
                            style={{ width: '100%', marginTop: 8, resize: 'vertical', borderRadius: 12, border: '1px solid rgba(0,0,0,0.12)', padding: 12 }}
                          />
                        </label>

                        <label style={{ display: 'block', marginBottom: 18 }}>
                          <strong>Observaciones</strong>
                          <textarea
                            value={draft.observations}
                            onChange={(event) => setDraft((prev) => ({ ...prev, observations: event.target.value }))}
                            rows={3}
                            style={{ width: '100%', marginTop: 8, resize: 'vertical', borderRadius: 12, border: '1px solid rgba(0,0,0,0.12)', padding: 12 }}
                          />
                        </label>

                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          <button type="button" className="sy-btn sy-btn--primary" onClick={handleFinalize}>
                            Finalizar atención
                          </button>
                          <button type="button" className="sy-btn sy-btn--outline" onClick={() => setActivePatientEmail(null)}>
                            Cancelar
                          </button>
                        </div>
                      </>
                    ) : (
                      <div style={{ padding: 14, borderRadius: 12, background: '#fef3c7', border: '1px solid #fde68a' }}>
                        <p style={{ margin: 0, color: '#92400e' }}>
                          No hay citas activas disponibles para este paciente. Seleccione otra cita en el panel de citas si desea revisar información.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
