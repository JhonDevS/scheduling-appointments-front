import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import mockUsers from '../../../src/mocks/data/users.json'
import BookAppointment from '../../../src/pages/BookAppointment'
import { resetUsersAdminStore, seedAuthenticatedUser } from '../../helpers/store'

const { listDoctorsMock } = vi.hoisted(() => ({
  listDoctorsMock: vi.fn(),
}))

vi.mock('../../../src/services/adminUsersService', () => ({
  default: {
    list: listDoctorsMock,
  },
}))

vi.mock('../../../src/hooks', async () => {
  const actual = await vi.importActual('../../../src/hooks')

  return {
    ...actual,
    useAuth: () => ({
      user: {
        email: 'paciente@saludya.com',
        nombreCompleto: 'Paciente Prueba',
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      loginWithOAuth: vi.fn(),
    }),
  }
})

describe('BookAppointment', () => {
  beforeEach(() => {
    resetUsersAdminStore()
    seedAuthenticatedUser()
    listDoctorsMock.mockResolvedValue(mockUsers)
  })

  it('muestra el doctor seleccionado al reprogramar aunque no esté en los primeros 4', async () => {
    const doctors = mockUsers.filter((u) => u.role === 'doctor')
    const selectedDoctor = doctors[6]

    const { container } = render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/book',
            state: {
              rescheduleAppointment: {
                id: 'test-appointment',
                doctorId: selectedDoctor.id,
                dateKey: '2026-05-26',
                time: '09:00 AM',
              },
            },
          },
        ]}
      >
        <BookAppointment />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.queryByText(/Cargando especialistas/i)).not.toBeInTheDocument()
    })

    expect(screen.getAllByText(selectedDoctor.name).length).toBeGreaterThan(0)

    expect(container.querySelectorAll('.sy-doctor-card').length).toBe(5)
    expect(screen.getByRole('button', { name: /Lista completa/i })).toBeInTheDocument()
  })
})
