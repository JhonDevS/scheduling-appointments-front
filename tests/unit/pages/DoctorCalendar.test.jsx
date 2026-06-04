import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { AuthProvider } from '../../../src/hooks'
import DoctorCalendar from '../../../src/pages/DoctorCalendar'
import mockUsers from '../../../src/mocks/data/users.json'
import { useUsersAdminStore } from '../../../src/store/usersAdminStore'
import { resetBookingsStore, resetUsersAdminStore, seedAuthenticatedUser } from '../../helpers/store'

describe('DoctorCalendar', () => {
  it('muestra mensaje sin horarios', () => {
    resetUsersAdminStore()
    resetBookingsStore([])
    useUsersAdminStore.getState().setUsers(mockUsers)
    seedAuthenticatedUser({
      id: 1,
      email: 'a.sterling@saludya.com',
      nombreCompleto: 'Dr. Alexander Sterling',
    })

    render(
      <AuthProvider>
        <MemoryRouter>
          <DoctorCalendar />
        </MemoryRouter>
      </AuthProvider>,
    )

    expect(
      screen.getByText(/No hay bloques de disponibilidad configurados para este médico/i),
    ).toBeInTheDocument()
  })
})
