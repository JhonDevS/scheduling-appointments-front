import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import TimeSlot from '../../../src/components/booking/TimeSlot'
import { SLOT_STATUS } from '../../../src/components/booking/timeSlotStatus'

describe('TimeSlot', () => {
  it('muestra franja ocupada como solo lectura en gris', () => {
    render(
      <TimeSlot
        time="09:00 AM"
        status={SLOT_STATUS.BOOKED}
        isSelected={false}
        onSelect={vi.fn()}
      />,
    )

    const slot = screen.getByLabelText(/09:00 AM, No disponible/i)
    expect(slot.tagName).toBe('DIV')
    expect(slot).toHaveAttribute('aria-disabled', 'true')
    expect(slot).toHaveClass('sy-time-slot--readonly')
    expect(screen.getByText('No disponible')).toBeInTheDocument()
  })

  it('permite seleccionar franjas disponibles', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <TimeSlot
        time="10:00 AM"
        status={SLOT_STATUS.AVAILABLE}
        isSelected={false}
        onSelect={onSelect}
      />,
    )

    await user.click(screen.getByRole('button', { name: /10:00 AM, disponible/i }))
    expect(onSelect).toHaveBeenCalledWith('10:00 AM')
  })
})
