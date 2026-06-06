import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import LoginPage from '../../../src/pages/LoginPage'

const mockNavigate = vi.fn()
const mockLogin = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      state: null,
    }),
  }
})

vi.mock('../../../src/hooks', () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: false,
  }),
}))

vi.mock('../../../src/components/auth/SocialLogin', () => ({
  default: () => <div data-testid="social-login" />,
}))

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza correctamente los elementos principales', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {
        name: /Bienvenido de nuevo/i,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByLabelText(/Correo electrónico/i),
    ).toBeInTheDocument()

    expect(
      screen.getByLabelText(/Contraseña/i),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: /Iniciar sesión con usuario y contraseña/i,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByTestId('social-login'),
    ).toBeInTheDocument()
  })

  it('muestra errores cuando el formulario está vacío', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.click(
      screen.getByRole('button', {
        name: /Iniciar sesión con usuario y contraseña/i,
      }),
    )

    expect(
      screen.getByText('El correo es obligatorio'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('La contraseña es obligatoria'),
    ).toBeInTheDocument()

    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('permite cambiar entre roles', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.click(
      screen.getByRole('tab', {
        name: /Doctor/i,
      }),
    )

    expect(
      screen.getByRole('tab', {
        name: /Doctor/i,
      }),
    ).toHaveClass('is-active')
  })

  it('realiza login exitoso y navega al dashboard del paciente', async () => {
    const user = userEvent.setup()

    mockLogin.mockResolvedValue({
      success: true,
    })

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.type(
      screen.getByLabelText(/Correo electrónico/i),
      'paciente@test.com',
    )

    await user.type(
      screen.getByLabelText(/Contraseña/i),
      '123456',
    )

    await user.click(
      screen.getByRole('button', {
        name: /Iniciar sesión con usuario y contraseña/i,
      }),
    )

    expect(mockLogin).toHaveBeenCalledWith(
      'paciente@test.com',
      '123456',
    )

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })

  it('muestra mensaje de error cuando el login falla', async () => {
    const user = userEvent.setup()

    mockLogin.mockResolvedValue({
      success: false,
      error: 'Credenciales inválidas',
    })

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.type(
      screen.getByLabelText(/Correo electrónico/i),
      'usuario@test.com',
    )

    await user.type(
      screen.getByLabelText(/Contraseña/i),
      'incorrecta',
    )

    await user.click(
      screen.getByRole('button', {
        name: /Iniciar sesión con usuario y contraseña/i,
      }),
    )

    expect(
      screen.getByText('Credenciales inválidas'),
    ).toBeInTheDocument()
  })

  it('redirige al home del doctor cuando se selecciona ese rol', async () => {
    const user = userEvent.setup()

    mockLogin.mockResolvedValue({
      success: true,
    })

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.click(
      screen.getByRole('tab', {
        name: /Doctor/i,
      }),
    )

    await user.type(
      screen.getByLabelText(/Correo electrónico/i),
      'doctor@test.com',
    )

    await user.type(
      screen.getByLabelText(/Contraseña/i),
      '123456',
    )

    await user.click(
      screen.getByRole('button', {
        name: /Iniciar sesión con usuario y contraseña/i,
      }),
    )

    expect(mockNavigate).toHaveBeenCalledWith('/doctor')
  })

  it('redirige al home del administrador cuando se selecciona ese rol', async () => {
    const user = userEvent.setup()

    mockLogin.mockResolvedValue({
      success: true,
    })

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.click(
      screen.getByRole('tab', {
        name: /Administrador/i,
      }),
    )

    await user.type(
      screen.getByLabelText(/Correo electrónico/i),
      'admin@test.com',
    )

    await user.type(
      screen.getByLabelText(/Contraseña/i),
      '123456',
    )

    await user.click(
      screen.getByRole('button', {
        name: /Iniciar sesión con usuario y contraseña/i,
      }),
    )

    expect(mockNavigate).toHaveBeenCalledWith('/admin')
  })
})