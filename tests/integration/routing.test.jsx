import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { resetAuthStore } from '../helpers/store'
import { renderApp } from '../helpers/test-utils'
import { createAuthApiMock } from './mocks/authApi.mock'

vi.mock('../../src/services/api', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    authApi: createAuthApiMock(),
  }
})

describe('Integración — rutas de la aplicación', () => {
  it('muestra la landing en /', async () => {
    resetAuthStore()
    renderApp('/')

    expect(await screen.findByRole('heading', { name: /gestión de salud/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cómo funciona/i })).toBeInTheDocument()
  })

  it('redirige rutas protegidas a login sin sesión', async () => {
    resetAuthStore()
    renderApp('/book')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /bienvenido de nuevo/i })).toBeInTheDocument()
    })
  })

  it('redirige /home a /dashboard con sesión', async () => {
    const { seedAuthenticatedUser } = await import('../helpers/store')
    seedAuthenticatedUser()
    renderApp('/home')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /buenos días/i })).toBeInTheDocument()
    })
  })

  it('redirige /calendar a flujo de reserva con sesión', async () => {
    const { seedAuthenticatedUser } = await import('../helpers/store')
    seedAuthenticatedUser()
    renderApp('/calendar')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /reserva tu cita/i })).toBeInTheDocument()
    })
  })

  it('muestra registro en /register', async () => {
    resetAuthStore()
    renderApp('/register')

    expect(await screen.findByRole('heading', { name: /crea tu cuenta/i })).toBeInTheDocument()
  })
})
