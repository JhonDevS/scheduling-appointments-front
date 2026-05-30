import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import BookAppointment from '../../../src/pages/BookAppointment'
import { AuthProvider } from '../../../src/hooks'
import { resetUsersAdminStore, seedAuthenticatedUser } from '../../helpers/store'
import { useUsersAdminStore } from '../../../src/store/usersAdminStore'

describe('BookAppointment', () => {
  beforeEach(() => {
    resetUsersAdminStore()
    seedAuthenticatedUser()
  })

  it('muestra el doctor seleccionado al reprogramar aunque no esté en los primeros 6', () => {
    const doctors = useUsersAdminStore.getState().users.filter((u) => u.role === 'doctor')
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

    const doctorCards = container.querySelectorAll('.sy-doctor-card')
    expect(doctorCards.length).toBeGreaterThan(6)
    expect(
      Array.from(doctorCards).some((card) => card.textContent.includes(selectedDoctor.name)),
    ).toBe(true)
    expect(screen.getByRole('button', { name: /Lista completa/i })).toBeInTheDocument()
  })
})
