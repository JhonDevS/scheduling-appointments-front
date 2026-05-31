import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAppointmentsBookingStore } from '../../src/store/appointmentsBookingStore'
import { getScheduleForDate } from '../../src/utils/bookingSchedule'
import {
  getFirstBookableDateKey,
  resetBookingsStore,
  seedAuthenticatedUser,
  seedBooking,
} from '../helpers/store'
import { renderApp } from '../helpers/test-utils'
import { createAuthApiMock } from './mocks/authApi.mock'

vi.mock('../../src/services/api', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    authApi: createAuthApiMock(),
  }
})

vi.mock('../../src/store/appointmentsBookingStore', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    isSlotInPast: () => false,
  }
})

describe('Integración — reserva de citas', () => {
  let bookingDateKey
  let bookedTime
  let freeTime

  beforeEach(() => {
    seedAuthenticatedUser()
    resetBookingsStore([])

    bookingDateKey = getFirstBookableDateKey()
    const schedule = getScheduleForDate(new Date(`${bookingDateKey}T12:00:00`))
    bookedTime = schedule.morning[0]
    freeTime = schedule.morning.at(-1) || schedule.afternoon.at(-1)

    seedBooking({
      doctorId: 1,
      dateKey: bookingDateKey,
      time: bookedTime,
    })
  })

  it('muestra franjas ocupadas como no disponibles (solo lectura)', async () => {
    renderApp('/book')

    const occupied = await screen.findByLabelText(
      new RegExp(`${bookedTime.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}, No disponible`, 'i'),
    )
    expect(occupied.tagName).toBe('DIV')
    expect(occupied).toHaveAttribute('aria-disabled', 'true')
  })

  it('confirma una cita en franja libre', async () => {
    const user = userEvent.setup()
    renderApp('/book')

    await screen.findByRole('heading', { name: /reserva tu cita/i })

    const freeSlot = await screen.findByRole('button', {
      name: new RegExp(`${freeTime.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}, disponible`, 'i'),
    })
    await user.click(freeSlot)

    const confirmBtn = screen.getByRole('button', { name: /confirmar cita/i })
    expect(confirmBtn).not.toBeDisabled()
    await user.click(confirmBtn)

    await waitFor(() => {
      expect(
        useAppointmentsBookingStore.getState().isSlotBooked(1, bookingDateKey, freeTime),
      ).toBe(true)
    })

    expect(screen.queryByText(/ya está reservado|no está disponible/i)).not.toBeInTheDocument()
  })

  it('no expone franjas ocupadas como botones seleccionables', async () => {
    renderApp('/book')

    await screen.findByRole('heading', { name: /reserva tu cita/i })

    expect(
      screen.getByLabelText(
        new RegExp(`${bookedTime.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}, No disponible`, 'i'),
      ).tagName,
    ).toBe('DIV')
    expect(
      screen.queryByRole('button', {
        name: new RegExp(`${bookedTime.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}, disponible`, 'i'),
      }),
    ).not.toBeInTheDocument()
  })
})
