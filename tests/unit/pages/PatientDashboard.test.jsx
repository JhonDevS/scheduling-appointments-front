import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

//  Mocks globales 

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

const mockUseAuth = vi.fn()
vi.mock('../../../src/hooks', () => ({
  useAuth: () => mockUseAuth(),
}))

const mockRemoveBooking = vi.fn()
const mockUseAppointmentsBookingStore = vi.fn()
vi.mock('../../../src/store/appointmentsBookingStore', () => ({
  useAppointmentsBookingStore: (selector) => mockUseAppointmentsBookingStore(selector),
}))

const mockUseUsersAdminStore = vi.fn()
vi.mock('../../../src/store/usersAdminStore', () => ({
  useUsersAdminStore: (selector) => mockUseUsersAdminStore(selector),
}))

const mockRequestRenewal = vi.fn()
const mockIsPending = vi.fn()
const mockUsePrescriptionRenewalsStore = vi.fn()
vi.mock('../../../src/store/prescriptionRenewalsStore', () => ({
  usePrescriptionRenewalsStore: (selector) => mockUsePrescriptionRenewalsStore(selector),
}))

vi.mock('../../../src/utils/downloadFile', () => ({
  downloadTextFile: vi.fn(),
}))

// Datos de prueba 

const FUTURE_DATE_KEY = '2099-12-01'
const PAST_DATE_KEY   = '2020-01-15'

const mockDoctors = [
  { id: '1', role: 'doctor', name: 'Dr. García', specialty: 'Cardiología' },
  { id: '2', role: 'doctor', name: 'Dra. López', specialty: 'Dermatología' },
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
    dateKey: FUTURE_DATE_KEY,
    time: '11:00 AM',
    status: 'confirmed',
  },
  {
    id: 'apt-3',
    patientEmail: 'otro@saludya.com',
    doctorId: '1',
    dateKey: FUTURE_DATE_KEY,
    time: '10:00 AM',
    status: 'confirmed',
  },
  {
    id: 'apt-past',
    patientEmail: 'paciente@saludya.com',
    doctorId: '2',
    dateKey: PAST_DATE_KEY,
    time: '02:00 PM',
    status: 'completed',
  },
]

//  Helper 

function setupMocks({
  email = 'paciente@saludya.com',
  nombreCompleto = 'Ana Gómez',
  bookings = mockBookings,
  doctors = mockDoctors,
  isPending = false,
  renewalResult = { success: true },
} = {}) {
  mockUseAuth.mockReturnValue({ user: { email, nombreCompleto } })

  mockUseAppointmentsBookingStore.mockImplementation((selector) =>
    selector({ bookings, removeBooking: mockRemoveBooking }),
  )

  mockUseUsersAdminStore.mockImplementation((selector) =>
    selector({ users: doctors }),
  )

  mockIsPending.mockReturnValue(isPending)
  mockRequestRenewal.mockReturnValue(renewalResult)
  mockUsePrescriptionRenewalsStore.mockImplementation((selector) =>
    selector({ requestRenewal: mockRequestRenewal, isPending: mockIsPending }),
  )
}

async function renderComponent() {
  const { default: PatientDashboard } = await import('../../../src/pages/PatientDashboard')
  return render(<PatientDashboard />)
}

// Tests

describe('PatientDashboard', () => {

  beforeEach(() => {
    mockNavigate.mockReset()
    mockRemoveBooking.mockReset()
    mockRequestRenewal.mockReset()
    mockIsPending.mockReset()
  })

  // Renderizado base 

  describe('Renderizado base', () => {
    it('renderiza el navbar y el footer', { timeout: 30000 }, async () => {
      setupMocks()
      await renderComponent()
      const navbars = screen.getAllByTestId('app-navbar')
      const footers = screen.getAllByTestId('app-footer')
      expect(navbars.length).toBeGreaterThan(0)
      expect(footers.length).toBeGreaterThan(0)
    })

    it('muestra el saludo con el nombre del paciente', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getAllByRole('heading', { name: /hola, ana gómez/i }).length).toBeGreaterThan(0)
    })

    it('muestra "Paciente" como fallback si no hay nombreCompleto', async () => {
      setupMocks({ nombreCompleto: '' })
      await renderComponent()
      expect(screen.getAllByRole('heading', { name: /hola, paciente/i }).length).toBeGreaterThan(0)
    })

    it('muestra el botón "Agendar nueva cita"', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByRole('button', { name: /agendar nueva cita/i })).toBeInTheDocument()
    })

    it('muestra el botón "Mis citas"', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByRole('button', { name: /mis citas/i })).toBeInTheDocument()
    })

    it('muestra la sección Resumen de salud', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByText(/resumen de salud/i)).toBeInTheDocument()
    })

    it('muestra las métricas de salud correctas', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByText(/72 lpm/i)).toBeInTheDocument()
      expect(screen.getByText(/120\/80 mmHg/i)).toBeInTheDocument()
      expect(screen.getByText(/74,5 kg/i)).toBeInTheDocument()
    })

    it('muestra el consejo de bienestar', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByText(/mantente hidratado/i)).toBeInTheDocument()
    })
  })

  //  Sin citas 

  describe('Sin citas próximas', () => {
    it('muestra "No hay citas próximas" cuando no hay bookings', async () => {
      setupMocks({ bookings: [] })
      await renderComponent()
      expect(screen.getByRole('heading', { name: /no hay citas próximas/i })).toBeInTheDocument()
    })

    it('muestra mensaje para reservar cuando no hay citas', async () => {
      setupMocks({ bookings: [] })
      await renderComponent()
      expect(screen.getByText(/reserva tu próxima consulta/i)).toBeInTheDocument()
    })

    it('muestra "Agendar cita" en el botón inferior cuando no hay citas', async () => {
      setupMocks({ bookings: [] })
      await renderComponent()
      expect(screen.getByRole('button', { name: /agendar cita/i })).toBeInTheDocument()
    })

    it('muestra mensaje en el header para reservar primera consulta', async () => {
      setupMocks({ bookings: [] })
      await renderComponent()
      expect(screen.getByText(/aún no tienes citas agendadas/i)).toBeInTheDocument()
    })
  })

  // Sin usuario autenticado

  describe('Sin usuario autenticado', () => {
    it('no muestra citas si user es null', async () => {
      setupMocks({ bookings: mockBookings })
      mockUseAuth.mockReturnValue({ user: null })
      await renderComponent()
      expect(screen.getByRole('heading', { name: /no hay citas próximas/i })).toBeInTheDocument()
    })
  })

  //  Próxima cita

  describe('Próxima cita', () => {
    it('muestra el nombre del doctor de la próxima cita', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getAllByText('Dr. García').length).toBeGreaterThan(0)
    })

    it('muestra la especialidad del doctor de la próxima cita', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getAllByText('Cardiología').length).toBeGreaterThan(0)
    })

    it('muestra la hora de la próxima cita', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByText('09:00 AM')).toBeInTheDocument()
    })

    it('muestra el badge "Próxima" en la primera cita', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByText('Próxima')).toBeInTheDocument()
    })

    it('muestra "Programada" en citas siguientes', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByText('Programada')).toBeInTheDocument()
    })

    it('muestra info de próxima cita en el header del panel', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByText(/tu próxima consulta es con/i)).toBeInTheDocument()
    })

    it('muestra "Reprogramar" en el botón inferior cuando hay citas', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByRole('button', { name: /reprogramar/i })).toBeInTheDocument()
    })

    it('usa "Especialista SaludYa" cuando el doctorId no existe en el mapa', async () => {
      const bookingsUnknown = [{
        id: 'apt-x',
        patientEmail: 'paciente@saludya.com',
        doctorId: '999',
        dateKey: FUTURE_DATE_KEY,
        time: '08:00 AM',
        status: 'confirmed',
      }]
      setupMocks({ bookings: bookingsUnknown })
      await renderComponent()
      expect(screen.getAllByText('Especialista SaludYa').length).toBeGreaterThan(0)
    })
  })

  // Filtrado por paciente

  describe('Filtrado por email del paciente', () => {
    it('no muestra citas de otros pacientes', async () => {
      setupMocks({ email: 'paciente@saludya.com' })
      await renderComponent()
      // apt-3 es de otro@saludya.com → solo deben verse 2 citas del paciente actual
      const programadas = screen.queryAllByText('Programada')
      // Solo 1 "Programada" (apt-2), no más
      expect(programadas.length).toBeLessThanOrEqual(1)
    })
  })

  //  Cancelar cita 

  describe('Cancelar cita', () => {
    it('llama a removeBooking con el id correcto al cancelar', async () => {
      setupMocks()
      await renderComponent()
      const cancelButtons = screen.getAllByRole('button', { name: /cancelar/i })
      fireEvent.click(cancelButtons[0])
      expect(mockRemoveBooking).toHaveBeenCalledWith('apt-1')
    })

    it('muestra mensaje de confirmación tras cancelar', async () => {
      setupMocks()
      await renderComponent()
      const cancelButtons = screen.getAllByRole('button', { name: /cancelar/i })
      fireEvent.click(cancelButtons[0])
      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent(/tu cita ha sido cancelada correctamente/i)
      })
    })
  })

  //  Reagendar 

  describe('Reagendar cita', () => {
    it('navega a /book con el estado de la cita al reagendar', async () => {
      setupMocks()
      await renderComponent()
      const reagendarButtons = screen.getAllByRole('button', { name: /reagendar/i })
      fireEvent.click(reagendarButtons[0])
      expect(mockNavigate).toHaveBeenCalledWith(
        '/book',
        expect.objectContaining({
          state: expect.objectContaining({ rescheduleAppointment: expect.any(Object) }),
        }),
      )
    })
  })

  //  Recetas 

  describe('Recetas recientes', () => {
    it('muestra solo 2 recetas por defecto', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByText('Amoxicilina')).toBeInTheDocument()
      expect(screen.getByText('Lisinopril')).toBeInTheDocument()
      expect(screen.queryByText('Ibuprofeno')).not.toBeInTheDocument()
    })

    it('muestra todas las recetas al hacer clic en "Ver todas"', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /ver todas/i }))
      await waitFor(() => {
        expect(screen.getByText('Ibuprofeno')).toBeInTheDocument()
      })
    })

    it('el botón cambia a "Ver menos" al expandir recetas', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /ver todas/i }))
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /ver menos/i })).toBeInTheDocument()
      })
    })

    it('muestra el badge ACTIVA para recetas activas', async () => {
      setupMocks()
      await renderComponent()
      const badges = screen.getAllByText('ACTIVA')
      expect(badges.length).toBeGreaterThan(0)
    })

    it('muestra el botón "Renovar" para recetas activas', async () => {
      setupMocks()
      await renderComponent()
      const renovarButtons = screen.getAllByRole('button', { name: /renovar/i })
      expect(renovarButtons.length).toBeGreaterThan(0)
    })

    it('deshabilita el botón "Renovar" cuando la solicitud está pendiente', async () => {
      setupMocks({ isPending: true })
      await renderComponent()
      const buttons = screen.getAllByRole('button', { name: /solicitud pendiente/i })
      buttons.forEach((btn) => expect(btn).toBeDisabled())
    })
  })

  //  Renovación de recetas 

  describe('Renovación de recetas', () => {
    it('llama a requestRenewal con el nombre del medicamento', async () => {
      setupMocks({ isPending: false })
      await renderComponent()
      const renovarButtons = screen.getAllByRole('button', { name: /renovar/i })
      fireEvent.click(renovarButtons[0])
      expect(mockRequestRenewal).toHaveBeenCalledWith('Amoxicilina')
    })

    it('muestra mensaje de éxito al renovar', async () => {
      setupMocks({ isPending: false, renewalResult: { success: true } })
      await renderComponent()
      const renovarButtons = screen.getAllByRole('button', { name: /renovar/i })
      fireEvent.click(renovarButtons[0])
      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent(/solicitud de renovación enviada para amoxicilina/i)
      })
    })

    it('muestra el error si la solicitud ya está pendiente', async () => {
      const errorMsg = 'Ya existe una solicitud pendiente para este medicamento.'
      setupMocks({
        isPending: false,
        renewalResult: { success: false, error: errorMsg },
      })
      await renderComponent()
      const renovarButtons = screen.getAllByRole('button', { name: /renovar/i })
      fireEvent.click(renovarButtons[0])
      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent(errorMsg)
      })
    })
  })

  //  Informe de salud

  describe('Informe de salud', () => {
    it('llama a downloadTextFile al hacer clic en "Informe completo"', async () => {
      const { downloadTextFile } = await import('../../../src/utils/downloadFile')
      setupMocks()
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /informe completo/i }))
      expect(downloadTextFile).toHaveBeenCalledWith(
        'informe-salud-saludya.txt',
        expect.stringContaining('Informe de salud'),
      )
    })
  })

  // Navegación

  describe('Navegación', () => {
    it('"Agendar nueva cita" navega a /book', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /agendar nueva cita/i }))
      expect(mockNavigate).toHaveBeenCalledWith('/book')
    })

    it('"Mis citas" navega a /appointments', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /mis citas/i }))
      expect(mockNavigate).toHaveBeenCalledWith('/appointments')
    })

    it('"Reprogramar" en el panel inferior navega a /book', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /reprogramar/i }))
      expect(mockNavigate).toHaveBeenCalledWith('/book')
    })

    it('"Agendar cita" en el panel inferior navega a /book cuando no hay citas', async () => {
      setupMocks({ bookings: [] })
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /agendar cita/i }))
      expect(mockNavigate).toHaveBeenCalledWith('/book')
    })
  })
})