import { describe, expect, it } from 'vitest'

import {
  resolveSlotStatus,
  SLOT_LABELS,
  SLOT_STATUS,
} from '../../../src/components/booking/timeSlotStatus'

describe('timeSlotStatus', () => {
  it('prioriza ocupada sobre pasada', () => {
    expect(resolveSlotStatus({ isBooked: true, isPast: true })).toBe(SLOT_STATUS.BOOKED)
  })

  it('marca franjas pasadas y disponibles', () => {
    expect(resolveSlotStatus({ isBooked: false, isPast: true })).toBe(SLOT_STATUS.PAST)
    expect(resolveSlotStatus({ isBooked: false, isPast: false })).toBe(SLOT_STATUS.AVAILABLE)
  })

  it('define etiqueta en español para ocupadas', () => {
    expect(SLOT_LABELS[SLOT_STATUS.BOOKED]).toBe('No disponible')
  })
})
