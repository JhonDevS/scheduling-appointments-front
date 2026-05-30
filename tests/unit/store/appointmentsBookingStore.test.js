import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAppointmentsBookingStore } from '../../../src/store/appointmentsBookingStore'
import { resetBookingsStore } from '../../helpers/store'

describe('appointmentsBookingStore', () => {
  beforeEach(() => {
    resetBookingsStore([])
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-26T10:00:00'))
  })

  it('registra una cita en franja libre', () => {
    const result = useAppointmentsBookingStore.getState().addBooking({
      doctorId: 1,
      dateKey: '2026-05-26',
      time: '09:00 AM',
      patientName: 'Ana',
      patientEmail: 'ana@saludya.com',
    })

    expect(result.success).toBe(true)
    expect(
      useAppointmentsBookingStore.getState().isSlotBooked(1, '2026-05-26', '09:00 AM'),
    ).toBe(true)
  })

  it('impide doble reserva en la misma franja del profesional', () => {
    const store = useAppointmentsBookingStore.getState()

    store.addBooking({
      doctorId: 1,
      dateKey: '2026-05-26',
      time: '10:00 AM',
      patientName: 'Primero',
      patientEmail: 'a@saludya.com',
    })

    const second = store.addBooking({
      doctorId: 1,
      dateKey: '2026-05-26',
      time: '10:00 AM',
      patientName: 'Segundo',
      patientEmail: 'b@saludya.com',
    })

    expect(second.success).toBe(false)
    expect(second.error).toMatch(/ya está reservado/i)
  })

  it('permite la misma hora para otro profesional', () => {
    const store = useAppointmentsBookingStore.getState()

    store.addBooking({
      doctorId: 1,
      dateKey: '2026-05-26',
      time: '11:00 AM',
      patientName: 'A',
      patientEmail: 'a@saludya.com',
    })

    const otherDoctor = store.addBooking({
      doctorId: 2,
      dateKey: '2026-05-26',
      time: '11:00 AM',
      patientName: 'B',
      patientEmail: 'b@saludya.com',
    })

    expect(otherDoctor.success).toBe(true)
  })
})
