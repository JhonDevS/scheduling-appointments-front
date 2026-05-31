import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthProvider } from '../../../src/hooks'
import mockUsers from '../../../src/mocks/data/users.json'
import BookAppointment from '../../../src/pages/BookAppointment'
import adminUsersService from '../../../src/services/adminUsersService'
import { resetUsersAdminStore, seedAuthenticatedUser } from '../../helpers/store'

vi.mock('../../../src/services/adminUsersService', () => ({
  default: {
    list: vi.fn(),
  },
}))

describe('BookAppointment', () => {
  beforeEach(() => {
    resetUsersAdminStore()
    seedAuthenticatedUser()
    vi.mocked(adminUsersService.list).mockResolvedValue(mockUsers)
  })

  it('muestra el doctor seleccionado al reprogramar aunque no esté en los primeros 6', async () => {
    const doctors = mockUsers.filter((u) => u.role === 'doctor')
    const selectedDoctor = doctors[6]

    const { container } = render(
      <AuthProvider>
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
        </MemoryRouter>
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(container.querySelectorAll('.sy-doctor-card').length).toBeGreaterThan(6)
    })

    const doctorCards = container.querySelectorAll('.sy-doctor-card')
    expect(
      Array.from(doctorCards).some((card) => card.textContent.includes(selectedDoctor.name)),
    ).toBe(true)
    expect(screen.getByRole('button', { name: /Lista completa/i })).toBeInTheDocument()
  })
})
