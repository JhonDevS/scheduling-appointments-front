import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { createAuthApiMock } from './mocks/authApi.mock'
import { renderApp } from '../helpers/test-utils'
import {
  resetAuthStore,
  resetNewsletterStore,
  resetPrescriptionRenewalsStore,
  resetUsersAdminStore,
  seedAuthenticatedUser,
} from '../helpers/store'

vi.mock('../../src/services/api', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    authApi: createAuthApiMock(),
  }
})

describe('Integración — nuevas funcionalidades UI', () => {
  it('suscribe newsletter en landing', async () => {
    const user = userEvent.setup()
    resetAuthStore()
    resetNewsletterStore()
    renderApp('/')

    await user.type(screen.getByLabelText(/correo médico/i), 'news@saludya.com')
    await user.click(screen.getByRole('button', { name: /comenzar/i }))

    await waitFor(() => {
      expect(screen.getByText(/gracias/i)).toBeInTheDocument()
    })
  })

  it('filtra citas en mis citas', async () => {
    const user = userEvent.setup()
    seedAuthenticatedUser()
    renderApp('/appointments')

    await screen.findByRole('heading', { name: /mis citas/i })
    await user.click(screen.getByRole('button', { name: /visitas pasadas/i }))

    expect(screen.getByText(/alistair cook/i)).toBeInTheDocument()
    expect(screen.queryByText(/marcus thorne/i)).not.toBeInTheDocument()
  })

  it('solicita renovación de receta en dashboard', async () => {
    const user = userEvent.setup()
    seedAuthenticatedUser()
    resetPrescriptionRenewalsStore()
    renderApp('/dashboard')

    await screen.findByRole('heading', { name: /buenos días/i })
    const [renewButton] = screen.getAllByRole('button', { name: /^renovar$/i })
    await user.click(renewButton)

    await waitFor(() => {
      expect(screen.getByText(/solicitud de renovación enviada/i)).toBeInTheDocument()
    })
  })

  it('navega a perfil desde navbar', async () => {
    seedAuthenticatedUser()
    renderApp('/profile')

    expect(await screen.findByRole('heading', { name: /mi perfil/i })).toBeInTheDocument()
  })

  it('gestiona usuarios en admin', async () => {
    const user = userEvent.setup()
    seedAuthenticatedUser({ nombreCompleto: 'Admin', email: 'admin@saludya.com' })
    resetUsersAdminStore()
    renderApp('/admin')

    await screen.findByRole('heading', { name: /gestión de usuarios/i })
    await user.click(screen.getByRole('button', { name: /doctores/i }))
    expect(screen.getByText(/alexander sterling/i)).toBeInTheDocument()
    expect(screen.queryByText(/elena rodríguez/i)).not.toBeInTheDocument()
  })

  it('abre rutas del portal médico', async () => {
    seedAuthenticatedUser()
    renderApp('/doctor/analytics')

    expect(await screen.findByRole('heading', { name: /analíticas/i })).toBeInTheDocument()
  })

  it('muestra ayuda en portal médico', async () => {
    const user = userEvent.setup()
    seedAuthenticatedUser()
    renderApp('/doctor')

    await screen.findByRole('heading', { name: /buenos días, elena/i })
    const helpButtons = await screen.findAllByRole('button', { name: /^ayuda$/i })
    await user.click(helpButtons[0])
    expect(await screen.findByRole('heading', { name: /centro de ayuda/i })).toBeInTheDocument()
  })
})
