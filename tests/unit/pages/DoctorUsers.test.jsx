import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import DoctorUsers from '../../../src/pages/DoctorUsers'
import { AuthProvider } from '../../../src/hooks'
import mockUsers from '../../../src/mocks/data/users.json'
import { useUsersAdminStore } from '../../../src/store/usersAdminStore'
import {
  resetBookingsStore,
  resetUsersAdminStore,
  seedAuthenticatedUser,
} from '../../helpers/store'

describe('DoctorUsers', () => {
  beforeEach(() => {
    resetUsersAdminStore()
    useUsersAdminStore.getState().setUsers(mockUsers)

    seedAuthenticatedUser({
      id: 1,
      email: 'a.sterling@saludya.com',
      nombreCompleto: 'Dr. Alexander Sterling',
    })
  })

  it('muestra únicamente los pacientes asociados al doctor autenticado', () => {
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
        doctorId: 'SY-2024-81',
        patientName: 'Ana Gómez',
        patientEmail: 'ana@test.com',
        dateKey: '2026-05-20',
        time: '10:00 AM',
        status: 'confirmed',
      },
      {
        id: 'apt-3',
        doctorId: 'SY-2024-82',
        patientName: 'Paciente Otro Doctor',
        patientEmail: 'otro@test.com',
        dateKey: '2026-05-21',
        time: '11:00 AM',
        status: 'confirmed',
      },
    ])

    render(
      <AuthProvider>
        <MemoryRouter>
          <DoctorUsers />
        </MemoryRouter>
      </AuthProvider>,
    )

    expect(
      screen.getByRole('heading', {
        name: /Gestión de pacientes/i,
      }),
    ).toBeInTheDocument()

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText('Ana Gómez')).toBeInTheDocument()

    expect(
      screen.queryByText('Paciente Otro Doctor'),
    ).not.toBeInTheDocument()
  })

  it('muestra mensaje cuando no existen pacientes para el doctor', () => {
    resetBookingsStore([])

    render(
      <AuthProvider>
        <MemoryRouter>
          <DoctorUsers />
        </MemoryRouter>
      </AuthProvider>,
    )

    expect(
      screen.getByText(/No hay pacientes registrados para este doctor/i),
    ).toBeInTheDocument()
  })

  it('permite abrir y cerrar la atención de un paciente', () => {
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
          <DoctorUsers />
        </MemoryRouter>
      </AuthProvider>,
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: /Atender/i,
      }),
    )

    expect(screen.getByText('Paciente')).toBeInTheDocument()
    expect(screen.getByText('Cita seleccionada')).toBeInTheDocument()
    expect(screen.getByText('Diagnóstico')).toBeInTheDocument()
    expect(screen.getByText('Receta / Medicamentos')).toBeInTheDocument()
    expect(screen.getByText('Observaciones')).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', {
        name: /Cerrar/i,
      }),
    )

    expect(screen.queryByText('Cita seleccionada')).not.toBeInTheDocument()
  })

  it('muestra la cantidad correcta de pacientes únicos', () => {
    resetBookingsStore([
      {
        id: 'apt-1',
        doctorId: 'SY-2024-81',
        patientName: 'Juan Pérez',
        patientEmail: 'juan@test.com',
        dateKey: '2026-05-15',
        time: '09:00 AM',
      },
      {
        id: 'apt-2',
        doctorId: 'SY-2024-81',
        patientName: 'Juan Pérez',
        patientEmail: 'juan@test.com',
        dateKey: '2026-05-20',
        time: '10:00 AM',
      },
      {
        id: 'apt-3',
        doctorId: 'SY-2024-81',
        patientName: 'Ana Gómez',
        patientEmail: 'ana@test.com',
        dateKey: '2026-05-25',
        time: '11:00 AM',
      },
    ])

    render(
      <AuthProvider>
        <MemoryRouter>
          <DoctorUsers />
        </MemoryRouter>
      </AuthProvider>,
    )

    expect(screen.getByText('Pacientes')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('muestra la cita atendida cuando no hay citas activas pendientes', () => {
    resetBookingsStore([
      {
        id: 'apt-1',
        doctorId: 'SY-2024-81',
        patientName: 'Juan Pérez',
        patientEmail: 'juan@test.com',
        dateKey: '2026-05-15',
        time: '09:00 AM',
        status: 'atendida',
      },
    ])

    render(
      <AuthProvider>
        <MemoryRouter>
          <DoctorUsers />
        </MemoryRouter>
      </AuthProvider>,
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: /Atender/i,
      }),
    )

    expect(screen.getByText(/Estado: atendida/i)).toBeInTheDocument()
    expect(screen.getByText('Diagnóstico')).toBeInTheDocument()
  })
})