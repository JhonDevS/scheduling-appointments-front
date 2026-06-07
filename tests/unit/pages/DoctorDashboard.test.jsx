import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

//  Mocks globales 

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useOutletContext: () => ({ searchQuery: '' }),
}))

const mockUseAuth = vi.fn()
vi.mock('../../../src/hooks', () => ({
  useAuth: () => mockUseAuth(),
}))

const mockAddSlot = vi.fn()
const mockUseDoctorAvailabilityStore = vi.fn()
vi.mock('../../../src/store/doctorAvailabilityStore', () => ({
  useDoctorAvailabilityStore: (selector) => mockUseDoctorAvailabilityStore(selector),
}))

const mockUseAppointmentsBookingStore = vi.fn()
vi.mock('../../../src/store/appointmentsBookingStore', () => ({
  useAppointmentsBookingStore: (selector) => mockUseAppointmentsBookingStore(selector),
}))

const mockUseUsersAdminStore = vi.fn()
vi.mock('../../../src/store/usersAdminStore', () => ({
  useUsersAdminStore: (selector) => mockUseUsersAdminStore(selector),
}))

//  Datos de prueba 

import { getDateInTimeZone, toDateKey } from '../../../src/utils/colombianHolidays'

const today      = getDateInTimeZone(new Date())
const tomorrow   = new Date(today); tomorrow.setDate(today.getDate() + 1)
const dayAfter   = new Date(today); dayAfter.setDate(today.getDate() + 2)
const nextWeek   = new Date(today); nextWeek.setDate(today.getDate() + 8)

const todayKey     = toDateKey(today)
const tomorrowKey  = toDateKey(tomorrow)
const dayAfterKey  = toDateKey(dayAfter)
const nextWeekKey  = toDateKey(nextWeek)

const DOCTOR_ID    = 'SY-2024-81'
const DOCTOR_EMAIL = 'doctor@saludya.com'

const mockDoctors = [
  { id: DOCTOR_ID, role: 'doctor', name: 'Dr. Martínez', email: DOCTOR_EMAIL, specialty: 'Medicina general' },
]

const mockBookings = [
  { id: 'b-1', doctorId: DOCTOR_ID, patientName: 'Ana Gómez',   patientEmail: 'ana@saludya.com',    dateKey: todayKey,    time: '09:00 AM', status: 'confirmed' },
  { id: 'b-2', doctorId: DOCTOR_ID, patientName: 'Luis Pérez',  patientEmail: 'luis@saludya.com',   dateKey: todayKey,    time: '10:00 AM', status: 'confirmed' },
  { id: 'b-3', doctorId: DOCTOR_ID, patientName: 'Sara Torres', patientEmail: 'sara@saludya.com',   dateKey: tomorrowKey, time: '08:00 AM', status: 'confirmed' },
  { id: 'b-4', doctorId: DOCTOR_ID, patientName: 'Marco Díaz',  patientEmail: 'marco@saludya.com',  dateKey: dayAfterKey, time: '11:00 AM', status: 'confirmed' },
  { id: 'b-5', doctorId: 'OTHER',   patientName: 'Otro Médico', patientEmail: 'otro@saludya.com',   dateKey: todayKey,    time: '09:00 AM', status: 'confirmed' },
  { id: 'b-6', doctorId: DOCTOR_ID, patientName: 'Rosa Lima',   patientEmail: 'rosa@saludya.com',   dateKey: nextWeekKey, time: '03:00 PM', status: 'confirmed' },
]

// Helper 

function setupMocks({
  email = DOCTOR_EMAIL,
  nombreCompleto = 'Dr. Martínez',
  bookings = mockBookings,
  doctors = mockDoctors,
  addSlotResult = { success: true },
} = {}) {
  mockUseAuth.mockReturnValue({ user: { email, nombreCompleto } })

  mockUseAppointmentsBookingStore.mockImplementation((selector) =>
    selector({ bookings }),
  )

  mockUseUsersAdminStore.mockImplementation((selector) =>
    selector({ users: doctors }),
  )

  mockAddSlot.mockReturnValue(addSlotResult)
  mockUseDoctorAvailabilityStore.mockImplementation((selector) =>
    selector({ addSlot: mockAddSlot, slots: [] }),
  )
}

async function renderComponent() {
  const { default: DoctorDashboard } = await import('../../../src/pages/DoctorDashboard')
  return render(<DoctorDashboard />)
}

//  Tests 

describe('DoctorDashboard', () => {

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    mockNavigate.mockReset()
    mockAddSlot.mockReset()
  })

  //  Renderizado base

  describe('Renderizado base', () => {
    it('muestra el saludo con el nombre del doctor', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByRole('heading', { name: /buenos días, dr\. martínez/i })).toBeInTheDocument()
    })

    it('usa nombreCompleto como fallback si el doctor no está en el mapa', async () => {
      setupMocks({ email: 'noexiste@saludya.com', doctors: [] })
      await renderComponent()
      expect(screen.getByRole('heading', { name: /buenos días, dr\. martínez/i })).toBeInTheDocument()
    })

    it('usa "el doctor" si no hay email ni nombreCompleto', async () => {
      mockUseAuth.mockReturnValue({ user: {} })
      mockUseAppointmentsBookingStore.mockImplementation((s) => s({ bookings: [] }))
      mockUseUsersAdminStore.mockImplementation((s) => s({ users: [] }))
      mockUseDoctorAvailabilityStore.mockImplementation((s) => s({ addSlot: mockAddSlot, slots: [] }))
      await renderComponent()
      expect(screen.getByText(/el doctor/i)).toBeInTheDocument()
    })

    it('muestra la sección "Crear disponibilidad"', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByText(/crear disponibilidad/i)).toBeInTheDocument()
    })

    it('muestra la sección "Nuevos pacientes"', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByText(/nuevos pacientes/i)).toBeInTheDocument()
    })

    it('muestra el botón "Ir al calendario"', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByRole('button', { name: /ir al calendario/i })).toBeInTheDocument()
    })
  })

  //  Estadísticas

  describe('Estadísticas', () => {
    it('muestra el total de citas del doctor (excluye otros doctores)', async () => {
      setupMocks()
      await renderComponent()
      // b-5 es de otro doctor, b-6 está fuera de la semana → total = 5 del DOCTOR_ID
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('muestra cuántas citas hay hoy', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByText(/2 hoy/i)).toBeInTheDocument()
    })

    it('muestra el nombre y hora de la próxima cita semanal', async () => {
      setupMocks()
      await renderComponent()
      const matches = screen.getAllByText(/ana gómez/i)
      expect(matches.length).toBeGreaterThan(0)
      const timeMatches = screen.getAllByText(/09:00 AM/i)
      expect(timeMatches.length).toBeGreaterThan(0)
    })

    it('muestra "Sin citas" en próxima cita si no hay bookings', async () => {
      setupMocks({ bookings: [] })
      await renderComponent()
      expect(screen.getByText(/sin citas/i)).toBeInTheDocument()
    })

    it('muestra cuántas citas hay esta semana en el párrafo descriptivo', async () => {
      setupMocks()
      await renderComponent()
      // b-1,b-2 hoy; b-3 mañana; b-4 pasado mañana = 4 dentro de la semana
      expect(screen.getByText(/4 citas programadas para esta semana/i)).toBeInTheDocument()
    })
  })

  //  Tabs de día 

  describe('Tabs de día', () => {
    it('muestra los tabs Hoy, Mañana y Pasado mañana', async () => {
      setupMocks()
      await renderComponent()
      const buttons = screen.getAllByRole('button')
      const dayButtons = buttons.filter(btn => /hoy|mañana|pasado/i.test(btn.textContent))
      expect(dayButtons.length).toBeGreaterThanOrEqual(3)
      expect(dayButtons.some(btn => /^hoy/i.test(btn.textContent))).toBe(true)
      expect(dayButtons.some(btn => /^mañana/i.test(btn.textContent))).toBe(true)
      expect(dayButtons.some(btn => /pasado mañana/i.test(btn.textContent))).toBe(true)
    })

    it('muestra citas de hoy por defecto', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByRole('heading', { level: 4, name: 'Ana Gómez' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 4, name: 'Luis Pérez' })).toBeInTheDocument()
    })

    it('cambia a citas de mañana al hacer clic en la tab Mañana', async () => {
      setupMocks()
      await renderComponent()
      const dateTabs = screen.getAllByRole('button', { name: /^mañana/i })
      fireEvent.click(dateTabs[dateTabs.length - 1])
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 4, name: 'Sara Torres' })).toBeInTheDocument()
      })
    })

    it('cambia a citas de pasado mañana al hacer clic en esa tab', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /pasado mañana/i }))
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 4, name: 'Marco Díaz' })).toBeInTheDocument()
      })
    })

    it('muestra "No hay eventos" cuando el día seleccionado no tiene citas', async () => {
      setupMocks({ bookings: mockBookings.filter((b) => b.dateKey === todayKey && b.doctorId === DOCTOR_ID) })
      await renderComponent()
      const dateTabs = screen.getAllByRole('button', { name: /^mañana/i })
      fireEvent.click(dateTabs[dateTabs.length - 1])
      await waitFor(() => {
        expect(screen.getByText(/no hay eventos que coincidan/i)).toBeInTheDocument()
      })
    })
  })

  //  Vista semanal 

  describe('Vista semanal', () => {
    it('cambia a vista semanal al hacer clic en "Semana"', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /^semana$/i }))
      await waitFor(() => {
        expect(screen.getByText(/cronograma semanal/i)).toBeInTheDocument()
      })
    })

    it('muestra el rango de la semana en vista semanal', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /^semana$/i }))
      await waitFor(() => {
        expect(screen.getByText(/mostrando programación de la semana completa/i)).toBeInTheDocument()
      })
    })

    it('muestra citas de varios días en vista semanal', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /^semana$/i }))
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 4, name: 'Ana Gómez' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { level: 4, name: 'Sara Torres' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { level: 4, name: 'Marco Díaz' })).toBeInTheDocument()
      })
    })

    it('vuelve a vista de día al hacer clic en "Día"', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /^semana$/i }))
      fireEvent.click(screen.getByRole('button', { name: /^día$/i }))
      await waitFor(() => {
        expect(screen.getByText(/cronograma diario/i)).toBeInTheDocument()
      })
    })
  })

  // Nuevos pacientes 

  describe('Nuevos pacientes', () => {
    it('muestra hasta 2 pacientes por defecto', async () => {
      setupMocks()
      await renderComponent()
      const aside = screen.getByRole('complementary')
      expect(within(aside).getByText('Ana Gómez')).toBeInTheDocument()
      expect(within(aside).getByText('Luis Pérez')).toBeInTheDocument()
    })

    it('muestra "Ver todo" para expandir la lista', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByRole('button', { name: /ver todo/i })).toBeInTheDocument()
    })

    it('muestra más pacientes al hacer clic en "Ver todo"', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /ver todo/i }))
      const aside = screen.getByRole('complementary')
      await waitFor(() => {
        expect(within(aside).getByText('Sara Torres')).toBeInTheDocument()
      })
    })

    it('cambia a "Ver menos" tras expandir', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /ver todo/i }))
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /ver menos/i })).toBeInTheDocument()
      })
    })

    it('muestra nota "Cita hoy" para pacientes de hoy', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByText(/cita hoy • 09:00 am/i)).toBeInTheDocument()
    })

    it('muestra nota "Mañana" para pacientes de mañana', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /ver todo/i }))
      await waitFor(() => {
        expect(screen.getByText(/mañana • 08:00 am/i)).toBeInTheDocument()
      })
    })
  })

  //  Crear disponibilidad 

  describe('Crear disponibilidad', () => {
    it('muestra los campos de fecha, hora inicio y hora fin', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByLabelText(/fecha/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/hora de inicio/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/hora de finalización/i)).toBeInTheDocument()
    })

    it('actualiza el campo fecha al escribir', async () => {
      setupMocks()
      await renderComponent()
      const input = screen.getByLabelText(/fecha/i)
      fireEvent.change(input, { target: { value: '2026-07-15' } })
      expect(input).toHaveValue('2026-07-15')
    })

    it('actualiza el campo hora de inicio al escribir', async () => {
      setupMocks()
      await renderComponent()
      const input = screen.getByLabelText(/hora de inicio/i)
      fireEvent.change(input, { target: { value: '08:00' } })
      expect(input).toHaveValue('08:00')
    })

    it('llama a addSlot con los datos del formulario al confirmar', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.change(screen.getByLabelText(/fecha/i),           { target: { value: '2026-07-15' } })
      fireEvent.change(screen.getByLabelText(/hora de inicio/i),  { target: { value: '08:00' } })
      fireEvent.change(screen.getByLabelText(/hora de finalización/i), { target: { value: '12:00' } })
      fireEvent.click(screen.getByRole('button', { name: /confirmar horario/i }))
      expect(mockAddSlot).toHaveBeenCalledWith({ date: '2026-07-15', startTime: '08:00', endTime: '12:00' })
    })

    it('muestra mensaje de éxito al confirmar horario', async () => {
      setupMocks({ addSlotResult: { success: true } })
      await renderComponent()
      fireEvent.change(screen.getByLabelText(/fecha/i),           { target: { value: '2026-07-15' } })
      fireEvent.change(screen.getByLabelText(/hora de inicio/i),  { target: { value: '08:00' } })
      fireEvent.change(screen.getByLabelText(/hora de finalización/i), { target: { value: '12:00' } })
      fireEvent.click(screen.getByRole('button', { name: /confirmar horario/i }))
      await waitFor(() => {
        expect(screen.getByText(/horario confirmado y guardado/i)).toBeInTheDocument()
      })
    })

    it('muestra el error de validación si addSlot falla', async () => {
      setupMocks({ addSlotResult: { success: false, error: 'Seleccione una fecha.' } })
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /confirmar horario/i }))
      await waitFor(() => {
        expect(screen.getByText(/seleccione una fecha/i)).toBeInTheDocument()
      })
    })
  })

  //  Navegación 

  describe('Navegación', () => {
    it('"Ir al calendario" navega a /doctor/calendar', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /ir al calendario/i }))
      expect(mockNavigate).toHaveBeenCalledWith('/doctor/calendar')
    })
  })
})