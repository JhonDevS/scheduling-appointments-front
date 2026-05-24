import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { createAuthApiMock } from './mocks/authApi.mock'
import { renderApp } from '../helpers/test-utils'
import { resetUsersAdminStore, seedAuthenticatedUser } from '../helpers/store'

vi.mock('../../src/services/api', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, authApi: createAuthApiMock() }
})

describe('Integración — administración de usuarios', () => {
  it('agrega usuario y pagina resultados', async () => {
    const user = userEvent.setup()
    seedAuthenticatedUser()
    resetUsersAdminStore()
    renderApp('/admin')

    await screen.findByRole('heading', { name: /gestión de usuarios/i })
    await user.click(screen.getByRole('button', { name: /agregar nuevo usuario/i }))
    await user.type(screen.getByLabelText(/^nombre$/i), 'Usuario Nuevo')
    await user.type(screen.getByLabelText(/^correo$/i), 'nuevo@saludya.com')
    await user.click(screen.getByRole('button', { name: /^guardar$/i }))

    await waitFor(() => {
      expect(screen.getByText(/de 5 entradas/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: '3' }))
    expect(screen.getByText(/usuario nuevo/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '2' }))
    expect(screen.getByText(/mostrando/i)).toBeInTheDocument()
  })

  it('filtra por estado suspendido', async () => {
    const user = userEvent.setup()
    seedAuthenticatedUser()
    resetUsersAdminStore()
    renderApp('/admin')

    await screen.findByRole('heading', { name: /gestión de usuarios/i })
    await user.selectOptions(screen.getByLabelText(/filtrar por estado/i), 'suspended')
    expect(screen.getByText(/marcus thorne/i)).toBeInTheDocument()
  })
})
