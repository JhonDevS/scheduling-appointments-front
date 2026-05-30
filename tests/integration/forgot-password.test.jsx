import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderApp } from '../helpers/test-utils'

describe('Integración — recuperar contraseña', () => {
  it('envía solicitud de restablecimiento', async () => {
    const user = userEvent.setup()
    renderApp('/forgot-password')

    await user.type(screen.getByLabelText(/correo electrónico/i), 'paciente@saludya.com')
    await user.click(screen.getByRole('button', { name: /enviar enlace/i }))

    await waitFor(() => {
      expect(screen.getByText(/recibirá instrucciones/i)).toBeInTheDocument()
    })
  })
})
