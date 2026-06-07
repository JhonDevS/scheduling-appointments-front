import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { AuthProvider } from '../../../src/hooks'
import DoctorCalendar from '../../../src/pages/DoctorCalendar'
import { AuthProvider } from '../../../src/hooks'
import { resetDoctorAvailabilityStore } from '../../helpers/store'

describe('DoctorCalendar', () => {
  it('muestra mensaje sin horarios', () => {
    resetDoctorAvailabilityStore()
    render(
      <AuthProvider>
        <DoctorCalendar />
      </AuthProvider>,
    )
    expect(screen.getByText(/no hay bloques/i)).toBeInTheDocument()
  })
})
