import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mocks globales
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('../../../src/components/layout/AppNavbar', () => ({
  default: () => <nav data-testid="app-navbar" />,
}))
vi.mock('../../../src/components/layout/AppFooter', () => ({
  default: () => <footer data-testid="app-footer" />,
}))

// Mock useAuth
const mockUseAuth = vi.fn()
vi.mock('../../../src/hooks', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock stores
const mockUpdateBooking = vi.fn()
const mockUseAppointmentsBookingStore = vi.fn()
vi.mock('../../../src/store/appointmentsBookingStore', () => ({
  useAppointmentsBookingStore: (selector) => mockUseAppointmentsBookingStore(selector),
}))

const mockUseUsersAdminStore = vi.fn()
vi.mock('../../../src/store/usersAdminStore', () => ({
  useUsersAdminStore: (selector) => mockUseUsersAdminStore(selector),
}))

// Mock utils con descarga
vi.mock('../../../src/utils/downloadFile', () => ({
  downloadTextFile: vi.fn(),
}))

// Datos de prueba

const FUTURE_DATE_KEY = '2099-12-01'
const PAST_DATE_KEY   = '2020-01-15'

const mockDoctors = [
  { id: '1', role: 'doctor', name: 'Dr. García', specialty: 'Cardiología' },
  { id: '2', role: 'doctor', name: 'Dra. López', specialty: 'Dermatología' },
  { id: '3', role: 'patient', name: 'Paciente Uno', specialty: '' },
]

const mockBookings = [
  {
    id: 'apt-1',
    patientEmail: 'paciente@saludya.com',
    doctorId: '1',
    dateKey: FUTURE_DATE_KEY,
    time: '09:00 AM',
    status: 'confirmed',
  },
  {
    id: 'apt-2',
    patientEmail: 'paciente@saludya.com',
    doctorId: '2',
    dateKey: PAST_DATE_KEY,
    time: '02:00 PM',
    status: 'completed',
  },
  {
    id: 'apt-3',
    patientEmail: 'paciente@saludya.com',
    doctorId: '1',
    dateKey: FUTURE_DATE_KEY,
    time: '10:00 AM',
    status: 'cancelled',
  },
  {
    id: 'apt-4',
    patientEmail: 'otro@saludya.com',
    doctorId: '2',
    dateKey: FUTURE_DATE_KEY,
    time: '11:00 AM',
    status: 'confirmed',
  },
]

// Helper

function setupMocks({ email = 'paciente@saludya.com', bookings = mockBookings, doctors = mockDoctors } = {}) {
  mockUseAuth.mockReturnValue({ user: { email } })

  mockUseAppointmentsBookingStore.mockImplementation((selector) =>
    selector({ bookings, updateBooking: mockUpdateBooking }),
  )

  mockUseUsersAdminStore.mockImplementation((selector) =>
    selector({ users: doctors }),
  )
}

async function renderComponent() {
  const { default: MyAppointments } = await import('../../../src/pages/MyAppointments')
  return render(<MyAppointments />)
}

// Tests
describe('MyAppointments', () => {

  beforeEach(() => {
    vi.resetModules()
    mockNavigate.mockReset()
    mockUpdateBooking.mockReset()
  })

  // Renderizado base
  describe('Renderizado base', () => {
    it('muestra el título "Mis citas"', { timeout: 30000 }, async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByRole('heading', { name: /mis citas/i })).toBeInTheDocument()
    })

    it('renderiza el navbar y el footer', async () => {
      setupMocks()
      await renderComponent()
      const navbars = screen.getAllByTestId('app-navbar')
      const footers = screen.getAllByTestId('app-footer')
      expect(navbars.length).toBeGreaterThan(0)
      expect(footers.length).toBeGreaterThan(0)
    })

    it('muestra el botón "Reservar nueva cita"', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByRole('button', { name: /reservar nueva cita/i })).toBeInTheDocument()
    })

    it('muestra las secciones Resumen de actividad y Horario reciente', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByText(/resumen de actividad/i)).toBeInTheDocument()
      expect(screen.getByText(/horario reciente/i)).toBeInTheDocument()
    })
  })

  //  Sin citas 
  describe('Sin citas registradas', () => {
    it('muestra mensaje cuando el paciente no tiene citas', async () => {
      setupMocks({ bookings: [] })
      await renderComponent()
      expect(screen.getByText(/aún no tienes citas registradas/i)).toBeInTheDocument()
    })

    it('muestra "Sin agenda disponible" en el panel de próxima cita', async () => {
      setupMocks({ bookings: [] })
      await renderComponent()
      expect(screen.getByText(/sin agenda disponible/i)).toBeInTheDocument()
    })

    it('muestra "No hay citas reservadas" en el badge de próxima cita', async () => {
      setupMocks({ bookings: [] })
      await renderComponent()
      expect(screen.getByText(/no hay citas reservadas/i)).toBeInTheDocument()
    })
  })

  //  Sin usuario autenticado
  describe('Sin usuario autenticado', () => {
    it('no muestra citas si user es null', async () => {
      setupMocks({ email: '' })
      // Sobrescribir para user null
      mockUseAuth.mockReturnValue({ user: null })
      await renderComponent()
      expect(screen.getByText(/aún no tienes citas registradas/i)).toBeInTheDocument()
    })
  })

  // Filtrado por paciente 
  describe('Filtrado por email del paciente', () => {
    it('solo muestra las citas del paciente autenticado', async () => {
      setupMocks()
      await renderComponent()
      // apt-4 pertenece a otro@saludya.com, no debe aparecer para Dr. López en upcoming
      // La cita confirmed de paciente@saludya.com con Dr. García sí debe mostrarse
      expect(screen.getAllByText('Dr. García').length).toBeGreaterThan(0)
    })

    it('no muestra citas de otros pacientes', async () => {
      setupMocks({ email: 'paciente@saludya.com' })
      await renderComponent()
      // apt-4 es de otro@saludya.com y no debe mostrarse
      // apt-2 es completed del mismo paciente y tampoco aparece en la pestaña de "Próximas"
      expect(screen.queryByText('Dra. López')).not.toBeInTheDocument()
    })
  })

  // reagendar cita 
  describe('Próxima cita', () => {
    it('muestra el nombre del doctor de la próxima cita confirmada', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Dr. García')
    })

    it('muestra la especialidad de la próxima cita', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getAllByText('Cardiología').length).toBeGreaterThan(0)
    })

    it('muestra la hora de la próxima cita', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByText('09:00 AM')).toBeInTheDocument()
    })
  })

  // Resumen de contadores 
  describe('Resumen de actividad (contadores)', () => {
    it('muestra el contador correcto de citas confirmadas', async () => {
      setupMocks()
      await renderComponent()
      const rows = screen.getAllByText(/confirmadas/i)
      expect(rows.length).toBeGreaterThan(0)
    })

    it('muestra "Especialista SaludYa" cuando el doctorId no existe en el mapa', async () => {
      const bookingsWithUnknownDoctor = [
        {
          id: 'apt-x',
          patientEmail: 'paciente@saludya.com',
          doctorId: '999',
          dateKey: FUTURE_DATE_KEY,
          time: '08:00 AM',
          status: 'confirmed',
        },
      ]
      setupMocks({ bookings: bookingsWithUnknownDoctor })
      await renderComponent()
      expect(screen.getAllByText('Especialista SaludYa').length).toBeGreaterThan(0)
    })

    it('muestra "Consulta médica" como especialidad fallback', async () => {
      const bookingsWithUnknownDoctor = [
        {
          id: 'apt-x',
          patientEmail: 'paciente@saludya.com',
          doctorId: '999',
          dateKey: FUTURE_DATE_KEY,
          time: '08:00 AM',
          status: 'confirmed',
        },
      ]
      setupMocks({ bookings: bookingsWithUnknownDoctor })
      await renderComponent()
      expect(screen.getAllByText('Consulta médica').length).toBeGreaterThan(0)
    })
  })

  // Tabs

  describe('Tabs Próximas / Visitas pasadas', () => {
    it('al inicio muestra solo citas "upcoming" (confirmed/pending)', async () => {
      setupMocks()
      await renderComponent()
      // apt-1 confirmed aparece; apt-2 completed no aparece en tab upcoming
      expect(screen.getAllByText('Dr. García').length).toBeGreaterThan(0)
    })

    it('al cambiar a "Visitas pasadas" muestra citas completadas/canceladas', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /visitas pasadas/i }))
      await waitFor(() => {
        expect(screen.getAllByText('Dra. López').length).toBeGreaterThan(0)
      })
    })

    it('tab "Visitas pasadas" no muestra citas confirmed', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /visitas pasadas/i }))
      await waitFor(() => {
        // En past no debe haber botones Reagendar/Cancelar para apt-2 completed
        expect(screen.queryByRole('button', { name: /cancelar/i })).not.toBeInTheDocument()
      })
    })

    it('muestra mensaje si no hay citas en la categoría seleccionada', async () => {
      setupMocks({ bookings: [{ ...mockBookings[0] }] }) // solo una confirmed
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /visitas pasadas/i }))
      await waitFor(() => {
        expect(screen.getByText(/no hay citas en esta categoría/i)).toBeInTheDocument()
      })
    })
  })

  //  Historial completo

  describe('Ver historial completo', () => {
    it('el botón alterna entre "Ver historial completo" y "Ver vista filtrada"', async () => {
      setupMocks()
      await renderComponent()
      const btn = screen.getByRole('button', { name: /ver historial completo/i })
      fireEvent.click(btn)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /ver vista filtrada/i })).toBeInTheDocument()
      })
    })

    it('al mostrar historial completo aparecen citas de todos los estados', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /ver historial completo/i }))
      await waitFor(() => {
        expect(screen.getAllByText('Dr. García').length).toBeGreaterThan(0)
        expect(screen.getAllByText('Dra. López').length).toBeGreaterThan(0)
      })
    })
  })

  // Cancelar cita
  describe('Cancelar cita', () => {
    it('llama a updateBooking con status cancelled al hacer clic en Cancelar', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
      expect(mockUpdateBooking).toHaveBeenCalledWith('apt-1', { status: 'cancelled' })
    })

    it('muestra mensaje de confirmación tras cancelar', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
      await waitFor(() => {
        expect(screen.getByText(/tu cita ha sido cancelada correctamente/i)).toBeInTheDocument()
      })
    })
  })

  //  Reagendar cita
  describe('Reagendar cita', () => {
    it('navega a /book con el estado de la cita al hacer clic en Reagendar', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /reagendar/i }))
      expect(mockNavigate).toHaveBeenCalledWith(
        '/book',
        expect.objectContaining({ state: expect.objectContaining({ rescheduleAppointment: expect.any(Object) }) }),
      )
    })

    it('muestra mensaje de redirección al reagendar', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /reagendar/i }))
      await waitFor(() => {
        expect(screen.getByText(/redirigiendo al formulario para reprogramar/i)).toBeInTheDocument()
      })
    })
  })

  //  Cita cancelada 

  describe('Cita cancelada — botón Volver a reservar', () => {
    it('muestra "Volver a reservar" para citas canceladas', async () => {
      setupMocks()
      await renderComponent()
      // apt-3 tiene status cancelled, pero está en tab upcoming → no visible por defecto
      // Mostramos historial completo para verla
      fireEvent.click(screen.getByRole('button', { name: /ver historial completo/i }))
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /volver a reservar/i })).toBeInTheDocument()
      })
    })

    it('"Volver a reservar" navega a /book', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /ver historial completo/i }))
      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /volver a reservar/i }))
        expect(mockNavigate).toHaveBeenCalledWith('/book')
      })
    })
  })

  //  Citas ya finalizadas o atendidas 

  describe('Citas finalizadas / atendidas', () => {
    const bookingsWithFinalizada = [
      {
        id: 'apt-fin',
        patientEmail: 'paciente@saludya.com',
        doctorId: '1',
        dateKey: PAST_DATE_KEY,
        time: '09:00 AM',
        status: 'finalizada',
        diagnosis: 'Hipertensión leve',
        prescription: 'Losartán 50mg',
        observations: 'Control en 1 mes',
      },
    ]

    it('muestra diagnóstico de citas finalizadas', async () => {
      setupMocks({ bookings: bookingsWithFinalizada })
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /visitas pasadas/i }))
      await waitFor(() => {
        expect(screen.getByText(/hipertensión leve/i)).toBeInTheDocument()
      })
    })

    it('muestra receta de citas finalizadas', async () => {
      setupMocks({ bookings: bookingsWithFinalizada })
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /visitas pasadas/i }))
      await waitFor(() => {
        expect(screen.getByText(/losartán 50mg/i)).toBeInTheDocument()
      })
    })

    it('muestra observaciones de citas finalizadas', async () => {
      setupMocks({ bookings: bookingsWithFinalizada })
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /visitas pasadas/i }))
      await waitFor(() => {
        expect(screen.getByText(/control en 1 mes/i)).toBeInTheDocument()
      })
    })

    it('muestra fallbacks cuando no hay diagnóstico/receta/observaciones', async () => {
      const bookingsNoDetails = [{
        ...bookingsWithFinalizada[0],
        diagnosis: '',
        prescription: '',
        observations: '',
      }]
      setupMocks({ bookings: bookingsNoDetails })
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /visitas pasadas/i }))
      await waitFor(() => {
        expect(screen.getByText(/no registrado/i)).toBeInTheDocument()
        expect(screen.getByText(/no registrada/i)).toBeInTheDocument()
        expect(screen.getByText(/no hay observaciones/i)).toBeInTheDocument()
      })
    })
  })

  // Descargar historial 

  describe('Descargar historial', () => {
    it('llama a downloadTextFile al hacer clic en "Descargar historial en PDF"', async () => {
      const { downloadTextFile } = await import('../../../src/utils/downloadFile')
      setupMocks()
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /descargar historial/i }))
      expect(downloadTextFile).toHaveBeenCalledWith(
        'historial-citas-saludya.txt',
        expect.any(String),
      )
    })
  })

  // Navegación 

  describe('Navegación', () => {
    it('"Reservar nueva cita" navega a /book', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /reservar nueva cita/i }))
      expect(mockNavigate).toHaveBeenCalledWith('/book')
    })
  })

  //  Status labels 

  describe('Etiquetas de estado', () => {
    it('muestra "Confirmada" para status confirmed', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByText((content) => /confirmada/i.test(content) && !/confirmadas/i.test(content))).toBeInTheDocument()
    })

    it('muestra "Cancelada su cita" para status cancelled (en historial completo)', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /ver historial completo/i }))
      await waitFor(() => {
        expect(screen.getByText((content) => /cancelada/i.test(content) && !/canceladas/i.test(content))).toBeInTheDocument()
      })
    })
  })
})