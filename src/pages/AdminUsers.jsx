import { useEffect, useMemo, useState } from 'react'

import DoctorLayout from '../components/layout/DoctorLayout'
import adminUsersService from '../services/adminUsersService'
import availabilityService from '../services/availabilityService'
import { useUsersAdminStore } from '../store/usersAdminStore'
import { ADMIN_PAGE_SIZE, filterUsers, paginateUsers } from '../utils/adminUsers'

const ROLE_LABEL = { doctor: 'DOCTOR', patient: 'PACIENTE', admin: 'ADMIN' }
const STATUS_LABEL = { active: 'Activo', suspended: 'Suspendido', pending: 'Pendiente' }

const ADMIN_MENU = [
  { to: '/admin', label: 'Gestión de usuarios', end: true },
  { to: '/admin/availability', label: 'Disponibilidad de médicos', end: true },
]

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  role: 'patient',
  status: 'active',
  specialty: '',
  identification: '',
  contractNumber: '',
  password: '',
  confirmPassword: '',
}

export default function AdminUsers() {
  const users = useUsersAdminStore((s) => s.users)
  const addUser = useUsersAdminStore((s) => s.addUser)
  const updateUser = useUsersAdminStore((s) => s.updateUser)
  const removeUser = useUsersAdminStore((s) => s.removeUser)
  const setUsers = useUsersAdminStore((s) => s.setUsers)

  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [availabilityDoctorId, setAvailabilityDoctorId] = useState(null)
  const [availabilitySlots, setAvailabilitySlots] = useState([])
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [availabilityError, setAvailabilityError] = useState('')
  const [availabilityForm, setAvailabilityForm] = useState({ dayOfWeek: 1, startTime: '09:00:00', endTime: '17:00:00', durationMinutes: 30 })

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        const result = await adminUsersService.list()
        if (!mounted) return
        if (Array.isArray(result)) {
          setUsers(result)
        } else {
          setUsers([])
        }
      } catch (error) {
        console.error('No se pudieron cargar los usuarios del backend', error)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [setUsers])

  const filtered = useMemo(
    () => filterUsers(users, { roleFilter, statusFilter }),
    [users, roleFilter, statusFilter],
  )

  const pagination = useMemo(() => paginateUsers(filtered, page, ADMIN_PAGE_SIZE), [filtered, page])

  const openAdd = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (user) => {
    setEditingId(user.id)
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      status: user.status,
      specialty: user.specialty || '',
      identification: user.identification || '',
      contractNumber: user.contractNumber || '',
      password: '',
      confirmPassword: '',
    })
    setFormError('')
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) {
      setFormError('Nombre y correo son obligatorios.')
      return
    }
    if (!editingId) {
      if (!form.password.trim()) {
        setFormError('La contraseña es obligatoria al crear un usuario.')
        return
      }
      if (form.password !== form.confirmPassword) {
        setFormError('Las contraseñas deben coincidir.')
        return
      }
    } else if (form.password.trim() && form.password !== form.confirmPassword) {
      setFormError('Las contraseñas deben coincidir.')
      return
    }

    if ((form.role === 'patient' || form.role === 'admin') && !form.identification.trim()) {
      setFormError('El número de identificación es obligatorio para pacientes y administradores.')
      return
    }
    if (form.role === 'doctor' && !form.contractNumber.trim()) {
      setFormError('El número de contrato es obligatorio para los doctores.')
      return
    }

    try {
      if (editingId) {
        const patch = { ...form }
        delete patch.password
        delete patch.confirmPassword
        const updated = await adminUsersService.update(editingId, patch)
        updateUser(editingId, updated)
      } else {
        const payload = { ...form }
        delete payload.confirmPassword
        const created = await adminUsersService.create(payload)
        addUser(created)
      }
      setModalOpen(false)
      setPage(1)
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Error al guardar el usuario.'
      setFormError(message)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este usuario?')) {
      try {
        await adminUsersService.remove(id)
        removeUser(id)
      } catch (error) {
        console.error(error)
      }
    }
  }

  const openAvailability = async (doctor) => {
    setAvailabilityDoctorId(doctor.id)
    setAvailabilitySlots([])
    setAvailabilityError('')
    setAvailabilityLoading(true)
    try {
      const slots = await availabilityService.getDoctorBaseAvailability(doctor.id)
      setAvailabilitySlots(slots)
    } catch (error) {
      console.error(error)
      setAvailabilityError('No se pudo cargar la disponibilidad de este médico.')
    } finally {
      setAvailabilityLoading(false)
    }
  }

  const handleAddAvailabilitySlot = async (event) => {
    event.preventDefault()
    if (!availabilityDoctorId) return
    try {
      const created = await availabilityService.addDoctorBaseSlot(availabilityDoctorId, availabilityForm)
      setAvailabilitySlots((prev) => [...prev, created])
      setAvailabilityForm({ ...availabilityForm })
    } catch (error) {
      console.error(error)
      setAvailabilityError('No se pudo agregar el bloque de disponibilidad.')
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
          <h1 style={{ margin: '0 0 8px' }}>Gestión de usuarios</h1>
          <p style={{ color: 'var(--sy-text-muted)', maxWidth: 640 }}>
            Supervise al personal clínico y los registros de pacientes. Gestione permisos, roles y el estado
            de las cuentas desde una interfaz centralizada.
          </p>
        </div>
        <button type="button" className="sy-btn sy-btn--primary" onClick={openAdd}>
          + Agregar nuevo usuario
        </button>
      </div>

      <div className="sy-filter-row">
        <div className="sy-filter-card">
          <h4>FILTROS RÁPIDOS</h4>
          <div className="sy-pills">
            {[
              { id: 'all', label: 'Todos los roles' },
              { id: 'doctor', label: 'Doctores' },
              { id: 'patient', label: 'Pacientes' },
              { id: 'admin', label: 'Administradores' },
            ].map((pill) => (
              <button
                key={pill.id}
                type="button"
                className={roleFilter === pill.id ? 'is-active' : ''}
                onClick={() => {
                  setRoleFilter(pill.id)
                  setPage(1)
                }}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
        <div className="sy-filter-card">
          <h4>ESTADO</h4>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--sy-border)' }}
            aria-label="Filtrar por estado"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="suspended">Suspendidos</option>
            <option value="pending">Pendientes</option>
          </select>
        </div>
        <div className="sy-total-card">
          <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>TOTAL DE USUARIOS</span>
          <strong>{filtered.length}</strong>
        </div>
      </div>

      <div className="sy-table-wrap">
        <table className="sy-table">
          <thead>
            <tr>
              <th>IDENTIDAD Y NOMBRE</th>
              <th>CORREO ELECTRÓNICO</th>
              <th>ROL ASIGNADO</th>
              <th>ESTADO DE LA CUENTA</th>
              <th>OPERACIONES</th>
            </tr>
          </thead>
          <tbody>
            {pagination.items.map((u) => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="sy-avatar" aria-hidden />
                    <div>
                      <strong>{u.name}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--sy-text-muted)' }}>
                        {u.role === 'doctor' && u.contractNumber
                          ? `Contrato: ${u.contractNumber}`
                          : `Identificación: ${u.identification || u.id}`}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  {u.email}
                  {u.phone ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--sy-text-muted)' }}>
                      Tel: {u.phone}
                    </div>
                  ) : null}
                </td>
                <td>
                  <div style={{ display: 'grid', gap: 4 }}>
                    <span className={`sy-role-badge sy-role-badge--${u.role}`}>{ROLE_LABEL[u.role]}</span>
                    {u.role === 'doctor' && u.specialty ? (
                      <span style={{ fontSize: '0.8rem', color: 'var(--sy-text-muted)' }}>
                        {u.specialty}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td>
                  <span
                    style={{
                      color:
                        u.status === 'active'
                          ? 'var(--sy-success)'
                          : u.status === 'suspended'
                            ? 'var(--sy-danger)'
                            : 'var(--sy-text-muted)',
                    }}
                  >
                    ● {STATUS_LABEL[u.status]}
                  </span>
                </td>
                <td>
                  <button type="button" aria-label={`Editar ${u.name}`} onClick={() => openEdit(u)}>
                    ✏️
                  </button>
                  <button type="button" aria-label={`Eliminar ${u.name}`} onClick={() => handleDelete(u.id)}>
                    🗑️
                  </button>
                  {u.role === 'doctor' && (
                    <button
                      type="button"
                      aria-label={`Gestionar disponibilidad de ${u.name}`}
                      onClick={() => openAvailability(u)}
                      style={{ marginLeft: 8 }}
                    >
                      📅
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="sy-pagination">
          <span>
            Mostrando {pagination.rangeStart}-{pagination.rangeEnd} de {pagination.total} entradas
          </span>
          <div>
            <button type="button" disabled={pagination.page <= 1} onClick={() => setPage((p) => p - 1)}>
              ‹
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={pagination.page === n ? 'is-active' : ''}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="sy-modal" role="dialog" aria-modal="true">
          <button type="button" className="sy-modal__backdrop" aria-label="Cerrar" onClick={() => setModalOpen(false)} />
          <div className="sy-modal__panel" style={{ maxWidth: 480 }}>
            <header className="sy-modal__header">
              <h2>{editingId ? 'Editar usuario' : 'Nuevo usuario'}</h2>
              <button type="button" className="sy-modal__close" onClick={() => setModalOpen(false)} aria-label="Cerrar">
                ×
              </button>
            </header>
            <form className="sy-modal__body" onSubmit={handleSave}>
              <div className="sy-field">
                <label htmlFor="user-name">Nombre</label>
                <input
                  id="user-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="sy-field">
                <label htmlFor="user-email">Correo</label>
                <input
                  id="user-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="sy-field">
                <label htmlFor="user-phone">Teléfono</label>
                <input
                  id="user-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
              <div className="sy-field">
                <label htmlFor="user-role">Rol</label>
                <select
                  id="user-role"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="patient">Paciente</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              {(form.role === 'patient' || form.role === 'admin') && (
                <div className="sy-field">
                  <label htmlFor="user-identification">Número de identificación</label>
                  <input
                    id="user-identification"
                    value={form.identification}
                    onChange={(e) => setForm({ ...form, identification: e.target.value })}
                    placeholder="CC, Cédula de extranjería, Pasaporte..."
                  />
                </div>
              )}
              {form.role === 'doctor' && (
                <div className="sy-field">
                  <label htmlFor="user-contract-number">Número de contrato</label>
                  <input
                    id="user-contract-number"
                    value={form.contractNumber}
                    onChange={(e) => setForm({ ...form, contractNumber: e.target.value })}
                    placeholder="Número de contrato del médico"
                  />
                </div>
              )}
              <div className="sy-field">
                <label htmlFor="user-status">Estado</label>
                <select
                  id="user-status"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="active">Activo</option>
                  <option value="pending">Pendiente</option>
                  <option value="suspended">Suspendido</option>
                </select>
              </div>
              <div className="sy-field">
                <label htmlFor="user-password">Contraseña</label>
                <input
                  id="user-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={editingId ? 'Dejar vacío para mantener la contraseña actual' : 'Ingrese una contraseña' }
                />
              </div>
              <div className="sy-field">
                <label htmlFor="user-confirm-password">Confirmar contraseña</label>
                <input
                  id="user-confirm-password"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder={editingId ? 'Dejar vacío para mantener la contraseña actual' : 'Repita la contraseña' }
                />
              </div>
              {form.role === 'doctor' && (
                <div className="sy-field">
                  <label htmlFor="user-specialty">Especialidad</label>
                  <input
                    id="user-specialty"
                    value={form.specialty}
                    onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                    placeholder="Cardiólogo, neurólogo, médico general..."
                  />
                </div>
              )}
              {formError && <p style={{ color: 'var(--sy-danger)' }}>{formError}</p>}
              <footer className="sy-modal__footer" style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="sy-btn sy-btn--primary">
                  Guardar
                </button>
                <button type="button" className="sy-btn sy-btn--outline" onClick={() => setModalOpen(false)}>
                  Cancelar
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {availabilityDoctorId && (
        <div className="sy-modal" role="dialog" aria-modal="true">
          <button
            type="button"
            className="sy-modal__backdrop"
            aria-label="Cerrar"
            onClick={() => {
              setAvailabilityDoctorId(null)
              setAvailabilitySlots([])
              setAvailabilityError('')
            }}
          />
          <div className="sy-modal__panel" style={{ maxWidth: 520 }}>
            <header className="sy-modal__header">
              <h2>Disponibilidad del médico</h2>
              <button
                type="button"
                className="sy-modal__close"
                onClick={() => {
                  setAvailabilityDoctorId(null)
                  setAvailabilitySlots([])
                  setAvailabilityError('')
                }}
                aria-label="Cerrar"
              >
                ×
              </button>
            </header>
            <div className="sy-modal__body" style={{ display: 'grid', gap: 16 }}>
              <div>
                <h3 style={{ marginBottom: 8 }}>Bloques actuales</h3>
                {availabilityLoading && <p>Cargando disponibilidad...</p>}
                {!availabilityLoading && availabilityError && (
                  <p style={{ color: 'var(--sy-danger)' }}>{availabilityError}</p>
                )}
                {!availabilityLoading && !availabilityError && availabilitySlots.length === 0 && (
                  <p style={{ color: 'var(--sy-text-muted)' }}>No hay bloques configurados para este médico.</p>
                )}
                {!availabilityLoading && !availabilityError && availabilitySlots.length > 0 && (
                  <ul className="sy-table" style={{ listStyle: 'none', padding: 0 }}>
                    {availabilitySlots.map((slot) => (
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

              <form onSubmit={handleAddAvailabilitySlot} style={{ borderTop: '1px solid var(--sy-border)', paddingTop: 12 }}>
                <h3 style={{ marginBottom: 8 }}>Agregar bloque de disponibilidad</h3>
                <div className="sy-field">
                  <label htmlFor="avail-day">Día de la semana</label>
                  <select
                    id="avail-day"
                    value={availabilityForm.dayOfWeek}
                    onChange={(e) => setAvailabilityForm({ ...availabilityForm, dayOfWeek: Number(e.target.value) })}
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
                    value={availabilityForm.startTime}
                    onChange={(e) => setAvailabilityForm({ ...availabilityForm, startTime: e.target.value })}
                  />
                </div>
                <div className="sy-field">
                  <label htmlFor="avail-end">Hora fin</label>
                  <input
                    id="avail-end"
                    type="time"
                    value={availabilityForm.endTime}
                    onChange={(e) => setAvailabilityForm({ ...availabilityForm, endTime: e.target.value })}
                  />
                </div>
                <div className="sy-field">
                  <label htmlFor="avail-duration">Duración (minutos)</label>
                  <input
                    id="avail-duration"
                    type="number"
                    min={5}
                    step={5}
                    value={availabilityForm.durationMinutes}
                    onChange={(e) => setAvailabilityForm({ ...availabilityForm, durationMinutes: Number(e.target.value) })}
                  />
                </div>
                <footer className="sy-modal__footer" style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" className="sy-btn sy-btn--primary">
                    Guardar bloque
                  </button>
                  <button
                    type="button"
                    className="sy-btn sy-btn--outline"
                    onClick={() => {
                      setAvailabilityDoctorId(null)
                      setAvailabilitySlots([])
                      setAvailabilityError('')
                    }}
                  >
                    Cerrar
                  </button>
                </footer>
              </form>
            </div>
          </div>
        </div>
      )}
    </DoctorLayout>
  )
}
