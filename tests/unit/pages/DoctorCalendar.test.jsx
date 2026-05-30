import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import DoctorCalendar from '../../../src/pages/DoctorCalendar'
import { resetDoctorAvailabilityStore } from '../../helpers/store'

describe('DoctorCalendar', () => {
  it('muestra mensaje sin horarios', () => {
    resetDoctorAvailabilityStore()
    render(<DoctorCalendar />)
    expect(screen.getByText(/no hay bloques/i)).toBeInTheDocument()
  })
})
