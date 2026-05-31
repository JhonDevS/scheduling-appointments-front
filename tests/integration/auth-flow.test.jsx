import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '../../src/store/authStore'
import { resetAuthStore, seedAuthenticatedUser } from '../helpers/store'
import { renderApp } from '../helpers/test-utils'
import { createAuthApiMock, mockUser } from './mocks/authApi.mock'

vi.mock('../../src/services/api', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    authApi: createAuthApiMock(),
  }
})

describe('Integración — autenticación', () => {
  beforeEach(() => {
    resetAuthStore()
  })

  it('permite iniciar sesión con correo y contraseña', async () => {
    const user = userEvent.setup()
    renderApp('/login')

    await screen.findByLabelText(/correo electrónico/i)
    await user.type(screen.getByLabelText(/correo electrónico/i), 'paciente@saludya.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'mi-clave-segura')
    await user.click(screen.getByRole('button', { name: /iniciar sesión con usuario/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /buenos días/i })).toBeInTheDocument()
    })
  })

  it('muestra botones de inicio con Gmail y Outlook/Hotmail', async () => {
    renderApp('/login')

    expect(await screen.findByRole('button', { name: /gmail/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /outlook \/ hotmail/i })).toBeInTheDocument()
  })

  it('redirige a login público si ya hay sesión en /login', async () => {
    seedAuthenticatedUser(mockUser)
    renderApp('/login')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /buenos días/i })).toBeInTheDocument()
    })
  })

  it('cierra sesión desde el panel del paciente', async () => {
    const user = userEvent.setup()
    seedAuthenticatedUser(mockUser)
    useAuthStore.getState().setToken('token-test')

    renderApp('/dashboard')
    await screen.findByRole('heading', { name: /buenos días/i })

    await user.click(screen.getByRole('button', { name: /cerrar sesión/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /bienvenido de nuevo/i })).toBeInTheDocument()
    })
  })
})
