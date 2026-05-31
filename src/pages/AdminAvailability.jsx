import { useEffect, useMemo, useState } from 'react'

import DoctorLayout from '../components/layout/DoctorLayout'
import adminUsersService from '../services/adminUsersService'
import availabilityService from '../services/availabilityService'
import { useUsersAdminStore } from '../store/usersAdminStore'

const ADMIN_MENU = [
  { to: '/admin', label: 'Gestión de usuarios', end: true },
  { to: '/admin/availability', label: 'Disponibilidad de médicos', end: true },
]

export default function AdminAvailability() {
  const users = useUsersAdminStore((s) => s.users)
  const setUsers = useUsersAdminStore((s) => s.setUsers)

  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [errorSlots, setErrorSlots] = useState('')
  const [form, setForm] = useState({
    dayOfWeek: 1,
    startTime: '09:00:00',
    endTime: '17:00:00',
    durationMinutes: 30,
  })

  // Cargar usuarios desde backend si aún no están en el store
  useEffect(() => {
    let mounted = true
    if (users.length > 0) return

    const load = async () => {
      try {
        const result = await adminUsersService.list()
        if (!mounted) return
        if (Array.isArray(result)) {
          setUsers(result)
        }
      } catch (error) {
        console.error('No se pudieron cargar los usuarios del backend', error)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [users.length, setUsers])

  const doctors = useMemo(
    () => users.filter((u) => u.role === 'doctor'),
    [users],
  )

  useEffect(() => {
    let mounted = true
    if (!selectedDoctorId) return

    const loadSlots = async () => {
      setLoadingSlots(true)
      setErrorSlots('')
      try {
        const doctorNumericId = Number(selectedDoctorId)
        if (Number.isNaN(doctorNumericId)) {
          setSlots([])
          return
        }
        const result = await availabilityService.getDoctorBaseAvailability(doctorNumericId)
        if (!mounted) return
        setSlots(result)
      } catch (error) {
        console.error(error)
        if (!mounted) return
        setErrorSlots('No se pudo cargar la disponibilidad para este médico.')
      } finally {
        if (mounted) setLoadingSlots(false)
      }
    }

    loadSlots()

    return () => {
      mounted = false
    }
  }, [selectedDoctorId])

  const handleAddSlot = async (event) => {
    event.preventDefault()
    if (!selectedDoctorId) return
    try {
      const doctorNumericId = Number(selectedDoctorId)
      const created = await availabilityService.addDoctorBaseSlot(doctorNumericId, form)
      setSlots((prev) => [...prev, created])
    } catch (error) {
      console.error(error)
      setErrorSlots('No se pudo agregar el bloque de disponibilidad.')
    }
  }

  return (
    <DoctorLayout
      portalTitle="PORTAL ADMINISTRADOR"
      menuItems={ADMIN_MENU}
      menuLabel="Portal administrativo"
      menuVariant="admin"
    >
      <div className="sy-admin-header">
        <div>
          <h1 style={{ margin: '0 0 8px' }}>Disponibilidad de médicos</h1>
          <p style={{ color: 'var(--sy-text-muted)', maxWidth: 640 }}>
            Configure y revise la disponibilidad de los profesionales médicos. Estos bloques de horario se
            utilizan para que los pacientes puedan reservar citas en línea.
          </p>
        </div>
      </div>

      <div className="sy-filter-row" style={{ marginBottom: 24 }}>
        <div className="sy-filter-card" style={{ flex: 2 }}>
          <h4>SELECCIONAR MÉDICO</h4>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--sy-border)' }}
          >
            <option value="">Elija un profesional</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} ({doc.email})
              </option>
            ))}
          </select>
          {!doctors.length && (
            <p style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--sy-text-muted)' }}>
              No hay médicos registrados todavía. Cree usuarios con rol "Doctor" en la sección de gestión de
              usuarios.
            </p>
          )}
        </div>
      </div>

      {selectedDoctorId ? (
        <div className="sy-portal-grid">
          <div>
            <h3>Bloques actuales</h3>
            {loadingSlots && <p>Cargando disponibilidad...</p>}
            {!loadingSlots && errorSlots && (
              <p style={{ color: 'var(--sy-danger)' }}>{errorSlots}</p>
            )}
            {!loadingSlots && !errorSlots && slots.length === 0 && (
              <p style={{ color: 'var(--sy-text-muted)' }}>
                No hay bloques configurados para este médico.
              </p>
            )}
            {!loadingSlots && !errorSlots && slots.length > 0 && (
              <ul className="sy-table" style={{ listStyle: 'none', padding: 0 }}>
                {slots.map((slot) => (
                  <li
                    key={slot.id}
                    style={{
                      padding: 10,
                      borderBottom: '1px solid var(--sy-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>
                      <strong>Día {slot.dayOfWeek}</strong> · {slot.startTime} – {slot.endTime}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--sy-text-muted)' }}>
                      Duración: {slot.durationMinutes} min
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside>
            <div className="sy-widget-teal" style={{ marginBottom: 20 }}>
              <h3 style={{ marginTop: 0 }}>Agregar bloque de disponibilidad</h3>
              <div className="sy-field">
                <label htmlFor="avail-day">Día de la semana</label>
                <select
                  id="avail-day"
                  value={form.dayOfWeek}
                  onChange={(e) => setForm({ ...form, dayOfWeek: Number(e.target.value) })}
                >
                  <option value={1}>Lunes</option>
                  <option value={2}>Martes</option>
                  <option value={3}>Miércoles</option>
                  <option value={4}>Jueves</option>
                  <option value={5}>Viernes</option>
                  <option value={6}>Sábado</option>
                  <option value={7}>Domingo</option>
                </select>
              </div>
              <div className="sy-field">
                <label htmlFor="avail-start">Hora inicio</label>
                <input
                  id="avail-start"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
              <div className="sy-field">
                <label htmlFor="avail-end">Hora fin</label>
                <input
                  id="avail-end"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </div>
              <div className="sy-field">
                <label htmlFor="avail-duration">Duración (minutos)</label>
                <input
                  id="avail-duration"
                  type="number"
                  min={5}
                  step={5}
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                />
              </div>
              <button
                type="submit"
                className="sy-btn sy-btn--white sy-btn--block"
                style={{ marginTop: 8 }}
                onClick={handleAddSlot}
              >
                Guardar bloque
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </DoctorLayout>
  )
}
