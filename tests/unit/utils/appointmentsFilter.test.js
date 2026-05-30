import { describe, expect, it } from 'vitest'

import { buildAppointmentsHistoryText, filterAppointmentsByTab } from '../../../src/utils/appointmentsFilter'

const SAMPLE = [
  { name: 'A', specialty: 'X', date: '1', time: '10', status: 'confirmed' },
  { name: 'B', specialty: 'Y', date: '2', time: '11', status: 'cancelled' },
]

describe('appointmentsFilter', () => {
  it('filtra citas próximas', () => {
    const upcoming = filterAppointmentsByTab(SAMPLE, 'upcoming')
    expect(upcoming).toHaveLength(1)
    expect(upcoming[0].status).toBe('confirmed')
  })

  it('filtra visitas pasadas', () => {
    const past = filterAppointmentsByTab(SAMPLE, 'past')
    expect(past).toHaveLength(1)
    expect(past[0].status).toBe('cancelled')
  })

  it('genera texto de historial', () => {
    const text = buildAppointmentsHistoryText(SAMPLE)
    expect(text).toMatch(/Historial de citas/)
    expect(text).toMatch(/A/)
    expect(text).toMatch(/cancelled/)
  })
})
