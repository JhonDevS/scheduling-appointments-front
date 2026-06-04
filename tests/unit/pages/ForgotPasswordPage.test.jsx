import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import ForgotPasswordPage from '../../../src/pages/ForgotPasswordPage'
import { authApi } from '../../../src/services/api'
import { vi } from 'vitest'

vi.mock('../../../src/services/api', () => ({
  authApi: {
    requestPasswordReset: vi.fn(),
  },
}))

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza correctamente el formulario', () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {
        name: /Recuperar contraseña/i,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByLabelText(/Correo electrónico/i),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: /Enviar enlace/i,
      }),
    ).toBeInTheDocument()
  })

  it('muestra un error cuando el correo está vacío', async () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>,
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: /Enviar enlace/i,
      }),
    )

    expect(
      screen.getByText(/Ingrese su correo electrónico/i),
    ).toBeInTheDocument()

    expect(authApi.requestPasswordReset).not.toHaveBeenCalled()
  })

  it('envía la solicitud y muestra mensaje de éxito', async () => {
    authApi.requestPasswordReset.mockResolvedValue({
      success: true,
    })

    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>,
    )

    fireEvent.change(
      screen.getByLabelText(/Correo electrónico/i),
      {
        target: {
          value: 'usuario@test.com',
        },
      },
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: /Enviar enlace/i,
      }),
    )

    await waitFor(() => {
      expect(authApi.requestPasswordReset).toHaveBeenCalledWith(
        'usuario@test.com',
      )
    })

    expect(
      screen.getByRole('status'),
    ).toHaveTextContent(
      /Si el correo existe en nuestro sistema/i,
    )
  })

  it('muestra el error retornado por la API', async () => {
    authApi.requestPasswordReset.mockResolvedValue({
      success: false,
      error: 'Correo no encontrado',
    })

    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>,
    )

    fireEvent.change(
      screen.getByLabelText(/Correo electrónico/i),
      {
        target: {
          value: 'usuario@test.com',
        },
      },
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: /Enviar enlace/i,
      }),
    )

    await waitFor(() => {
      expect(
        screen.getByText(/Correo no encontrado/i),
      ).toBeInTheDocument()
    })
  })

  it('muestra el error por defecto cuando la API falla sin mensaje', async () => {
    authApi.requestPasswordReset.mockResolvedValue({
      success: false,
    })

    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>,
    )

    fireEvent.change(
      screen.getByLabelText(/Correo electrónico/i),
      {
        target: {
          value: 'usuario@test.com',
        },
      },
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: /Enviar enlace/i,
      }),
    )

    await waitFor(() => {
      expect(
        screen.getByText(/No se pudo enviar el enlace/i),
      ).toBeInTheDocument()
    })
  })

  it('muestra estado de carga mientras se procesa la solicitud', async () => {
    authApi.requestPasswordReset.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true }), 50),
        ),
    )

    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>,
    )

    fireEvent.change(
      screen.getByLabelText(/Correo electrónico/i),
      {
        target: {
          value: 'usuario@test.com',
        },
      },
    )

    fireEvent.click(
      screen.getByRole('button'),
    )

    expect(
      screen.getByRole('button'),
    ).toHaveTextContent('Enviando…')

    await waitFor(() => {
      expect(
        screen.getByRole('status'),
      ).toBeInTheDocument()
    })
  })
})