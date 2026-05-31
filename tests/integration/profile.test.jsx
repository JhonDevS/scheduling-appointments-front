import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '../../src/store/authStore'
import { seedAuthenticatedUser } from '../helpers/store'
import { renderApp } from '../helpers/test-utils'
import { createAuthApiMock } from './mocks/authApi.mock'

vi.mock('../../src/services/api', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, authApi: createAuthApiMock() }
})

describe('Integración — perfil de usuario', () => {
  it('actualiza nombre y correo', async () => {
    const user = userEvent.setup()
    seedAuthenticatedUser({ nombreCompleto: 'Antes', email: 'antes@saludya.com' })
    renderApp('/profile')

    await screen.findByRole('heading', { name: /mi perfil/i })
    const nameInput = screen.getByLabelText(/nombre completo/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Después Actualizado')
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }))

    await waitFor(() => {
      expect(screen.getByText(/perfil actualizado/i)).toBeInTheDocument()
    })
    expect(useAuthStore.getState().user.nombreCompleto).toBe('Después Actualizado')
  })
})
