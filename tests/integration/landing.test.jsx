import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { resetAuthStore, resetNewsletterStore } from '../helpers/store'
import { renderApp } from '../helpers/test-utils'
import { createAuthApiMock } from './mocks/authApi.mock'

vi.mock('../../src/services/api', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    authApi: createAuthApiMock(),
  }
})

describe('Integración — página de inicio', () => {
  it('abre el modal de cómo funciona', async () => {
    const user = userEvent.setup()
    resetAuthStore()
    renderApp('/')

    await user.click(screen.getByRole('button', { name: /cómo funciona/i }))

    expect(
      await screen.findByRole('heading', { name: /cómo funciona saludya/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/cree su cuenta o inicie sesión/i)).toBeInTheDocument()
  })

  it('reprogramar en vista previa navega a reserva', async () => {
    const user = userEvent.setup()
    resetAuthStore()
    renderApp('/')

    const rescheduleButtons = screen.getAllByRole('button', { name: /reprogramar/i })
    await user.click(rescheduleButtons[rescheduleButtons.length - 1])

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /bienvenido de nuevo/i })).toBeInTheDocument()
    })
  })
})
