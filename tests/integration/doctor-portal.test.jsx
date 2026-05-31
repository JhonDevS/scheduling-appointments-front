import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { useDoctorAvailabilityStore } from '../../src/store/doctorAvailabilityStore'
import { resetDoctorAvailabilityStore, seedAuthenticatedUser } from '../helpers/store'
import { renderApp } from '../helpers/test-utils'
import { createAuthApiMock } from './mocks/authApi.mock'

vi.mock('../../src/services/api', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, authApi: createAuthApiMock() }
})

describe('Integración — portal médico', () => {
  it('confirma disponibilidad en el panel', async () => {
    const user = userEvent.setup()
    seedAuthenticatedUser()
    resetDoctorAvailabilityStore()
    renderApp('/doctor')

    await screen.findByRole('heading', { name: /buenos días, elena/i })
    await user.type(screen.getByLabelText(/^fecha$/i), '2026-06-15')
    await user.type(screen.getByLabelText(/hora de inicio/i), '09:00')
    await user.type(screen.getByLabelText(/hora de finalización/i), '12:00')
    await user.click(screen.getByRole('button', { name: /confirmar horario/i }))

    await waitFor(() => {
      expect(screen.getByText(/horario confirmado/i)).toBeInTheDocument()
    })
  })

  it('lista disponibilidad en calendario', async () => {
    seedAuthenticatedUser()
    resetDoctorAvailabilityStore()
    useDoctorAvailabilityStore.getState().addSlot({
      date: '2026-06-15',
      startTime: '09:00',
      endTime: '12:00',
    })
    renderApp('/doctor/calendar')
    expect(await screen.findByText(/2026-06-15/)).toBeInTheDocument()
  })

  it('guarda preferencias en configuración', async () => {
    const user = userEvent.setup()
    seedAuthenticatedUser()
    renderApp('/doctor/settings')

    await screen.findByRole('heading', { name: /configuración/i })
    await user.click(screen.getByLabelText(/recordatorios por sms/i))
    await user.click(screen.getByRole('button', { name: /guardar preferencias/i }))
    expect(await screen.findByText(/preferencias guardadas/i)).toBeInTheDocument()
  })

  it('abre panel de notificaciones', async () => {
    const user = userEvent.setup()
    seedAuthenticatedUser()
    renderApp('/doctor')

    await screen.findByRole('heading', { name: /buenos días, elena/i })
    await user.click(screen.getByRole('button', { name: /notificaciones/i }))
    expect(screen.getByRole('region', { name: /notificaciones/i })).toBeInTheDocument()
  })
})
