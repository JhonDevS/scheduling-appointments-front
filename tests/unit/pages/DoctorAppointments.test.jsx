import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import DoctorAppointments from '../../../src/pages/DoctorAppointments'
import { AuthProvider } from '../../../src/hooks'
import mockUsers from '../../../src/mocks/data/users.json'
import { useUsersAdminStore } from '../../../src/store/usersAdminStore'
import {
  resetBookingsStore,
  resetUsersAdminStore,
  seedAuthenticatedUser,
} from '../../helpers/store'

describe('DoctorAppointments', () => {
  beforeEach(() => {
    resetUsersAdminStore()
    useUsersAdminStore.getState().setUsers(mockUsers)

    seedAuthenticatedUser({
      id: 1,
      email: 'a.sterling@saludya.com',
      nombreCompleto: 'Dr. Alexander Sterling',
    })
  })

  it('muestra las citas asignadas al doctor autenticado', async () => {
    resetBookingsStore([
      {
        id: 'apt-1',
        doctorId: 'SY-2024-81',
        patientName: 'Juan Pérez',
        patientEmail: 'juan@test.com',
        dateKey: '2026-05-15',
        time: '09:00 AM',
        status: 'confirmed',
      },
      {
        id: 'apt-2',
        doctorId: 'SY-2024-82',
        patientName: 'María López',
        patientEmail: 'maria@test.com',
        dateKey: '2026-05-16',
        time: '10:00 AM',
        status: 'confirmed',
      },
    ])

    render(
      <AuthProvider>
        <MemoryRouter>
          <DoctorAppointments />
        </MemoryRouter>
      </AuthProvider>,
    )

    expect(
      await screen.findByRole('heading', {
        name: /Citas de Dr\. Alexander Sterling/i,
      }),
    ).toBeInTheDocument()

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText('juan@test.com')).toBeInTheDocument()

    expect(screen.queryByText('María López')).not.toBeInTheDocument()
  })

  it('muestra mensaje cuando no existen citas para el doctor', () => {
    resetBookingsStore([])

    render(
      <AuthProvider>
        <MemoryRouter>
          <DoctorAppointments />
        </MemoryRouter>
      </AuthProvider>,
    )

    expect(
      screen.getByText(/No hay citas registradas para este profesional/i),
    ).toBeInTheDocument()
  })

  it('permite abrir y cerrar los detalles de una cita', () => {
    resetBookingsStore([
      {
        id: 'apt-1',
        doctorId: 'SY-2024-81',
        patientName: 'Juan Pérez',
        patientEmail: 'juan@test.com',
        dateKey: '2026-05-15',
        time: '09:00 AM',
        status: 'confirmed',
      },
    ])

    render(
      <AuthProvider>
        <MemoryRouter>
          <DoctorAppointments />
        </MemoryRouter>
      </AuthProvider>,
    )

    const detailsButton = screen.getByRole('button', {
      name: /Ver detalles/i,
    })

    fireEvent.click(detailsButton)

    expect(screen.getByText('Diagnóstico')).toBeInTheDocument()
    expect(screen.getByText('Receta / Medicamentos')).toBeInTheDocument()
    expect(screen.getByText('Observaciones')).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', {
        name: /Ocultar detalles/i,
      }),
    )

    expect(screen.queryByText('Diagnóstico')).not.toBeInTheDocument()
  })

  it('muestra la información clínica de una cita finalizada', () => {
    resetBookingsStore([
      {
        id: 'apt-1',
        doctorId: 'SY-2024-81',
        patientName: 'Juan Pérez',
        patientEmail: 'juan@test.com',
        dateKey: '2026-05-15',
        time: '09:00 AM',
        status: 'atendida',
        diagnosis: 'Gripe común',
        prescription: 'Acetaminofén',
        observations: 'Reposo por 3 días',
      },
    ])

    render(
      <AuthProvider>
        <MemoryRouter>
          <DoctorAppointments />
        </MemoryRouter>
      </AuthProvider>,
    )

    expect(screen.getByText(/Diagnóstico:/i)).toBeInTheDocument()
    expect(screen.getByText(/Gripe común/i)).toBeInTheDocument()

    expect(screen.getByText(/Receta:/i)).toBeInTheDocument()
    expect(screen.getByText(/Acetaminofén/i)).toBeInTheDocument()

    expect(screen.getByText(/Observaciones:/i)).toBeInTheDocument()
    expect(screen.getByText(/Reposo por 3 días/i)).toBeInTheDocument()
  })
})