import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

//  Mocks globales 

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}))

vi.mock('../../../src/components/layout/LegalLink', () => ({
  default: ({ children }) => <span>{children}</span>,
}))

const mockRegister = vi.fn()
vi.mock('../../../src/hooks', () => ({
  useAuth: () => ({ register: mockRegister }),
}))

//  Helper 

async function renderComponent() {
  const { default: RegisterPage } = await import('../../../src/pages/RegisterPage')
  return render(<RegisterPage />)
}

function fillForm({
  identification = '123456789',
  fullName = 'Juan Pérez',
  email = 'juan@saludya.com',
  phone = '3001234567',
  password = 'Segura@123',
  acceptTerms = true,
} = {}) {
  if (identification !== null)
    fireEvent.change(screen.getByLabelText(/número de identificación/i), { target: { name: 'identification', value: identification } })
  if (fullName !== null)
    fireEvent.change(screen.getByLabelText(/nombre completo/i), { target: { name: 'fullName', value: fullName } })
  if (email !== null)
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { name: 'email', value: email } })
  if (phone !== null)
    fireEvent.change(screen.getByLabelText(/número de teléfono/i), { target: { name: 'phone', value: phone } })
  if (password !== null)
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { name: 'password', value: password } })
  if (acceptTerms)
    fireEvent.click(screen.getByRole('checkbox'))
}

//  Tests 

describe('RegisterPage', () => {

  beforeEach(() => {
    vi.resetModules()
    mockNavigate.mockReset()
    mockRegister.mockReset()
  })

  //  Renderizado base 

  describe('Renderizado base', () => {
    it('muestra el título "Crea tu cuenta"', async () => {
      await renderComponent()
      expect(screen.getByRole('heading', { name: /crea tu cuenta/i })).toBeInTheDocument()
    })

    it('muestra el enlace al login', async () => {
      await renderComponent()
      expect(screen.getByRole('link', { name: /inicia sesión/i })).toHaveAttribute('href', '/login')
    })

    it('muestra el enlace al home en el logo', async () => {
      await renderComponent()
      expect(screen.getByRole('link', { name: /saludya/i })).toHaveAttribute('href', '/')
    })

    it('muestra el botón "Crear cuenta"', async () => {
      await renderComponent()
      expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument()
    })

    it('muestra los 5 campos del formulario', async () => {
      await renderComponent()
      expect(screen.getByLabelText(/número de identificación/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/número de teléfono/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    })

    it('muestra el checkbox de términos y condiciones', async () => {
      await renderComponent()
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('todos los campos comienzan vacíos', async () => {
      await renderComponent()
      expect(screen.getByLabelText(/número de identificación/i)).toHaveValue('')
      expect(screen.getByLabelText(/nombre completo/i)).toHaveValue('')
      expect(screen.getByLabelText(/correo electrónico/i)).toHaveValue('')
      expect(screen.getByLabelText(/número de teléfono/i)).toHaveValue('')
      expect(screen.getByLabelText(/contraseña/i)).toHaveValue('')
      expect(screen.getByRole('checkbox')).not.toBeChecked()
    })
  })

  //  Interacción con campos 

  describe('Edición de campos', () => {
    it('actualiza el campo identificación al escribir', async () => {
      await renderComponent()
      const input = screen.getByLabelText(/número de identificación/i)
      fireEvent.change(input, { target: { name: 'identification', value: '987654321' } })
      expect(input).toHaveValue('987654321')
    })

    it('actualiza el campo nombre al escribir', async () => {
      await renderComponent()
      const input = screen.getByLabelText(/nombre completo/i)
      fireEvent.change(input, { target: { name: 'fullName', value: 'María López' } })
      expect(input).toHaveValue('María López')
    })

    it('actualiza el campo email al escribir', async () => {
      await renderComponent()
      const input = screen.getByLabelText(/correo electrónico/i)
      fireEvent.change(input, { target: { name: 'email', value: 'maria@saludya.com' } })
      expect(input).toHaveValue('maria@saludya.com')
    })

    it('actualiza el campo teléfono al escribir', async () => {
      await renderComponent()
      const input = screen.getByLabelText(/número de teléfono/i)
      fireEvent.change(input, { target: { name: 'phone', value: '3109876543' } })
      expect(input).toHaveValue('3109876543')
    })

    it('actualiza el campo contraseña al escribir', async () => {
      await renderComponent()
      const input = screen.getByLabelText(/contraseña/i)
      fireEvent.change(input, { target: { name: 'password', value: 'MiClave@99' } })
      expect(input).toHaveValue('MiClave@99')
    })

    it('marca el checkbox al hacer clic', async () => {
      await renderComponent()
      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)
      expect(checkbox).toBeChecked()
    })

    it('desmarca el checkbox al hacer clic dos veces', async () => {
      await renderComponent()
      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)
      fireEvent.click(checkbox)
      expect(checkbox).not.toBeChecked()
    })
  })

  //  Validación 

  describe('Validación del formulario', () => {
    it('muestra error si identificación está vacía', async () => {
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
      await waitFor(() => {
        expect(screen.getByText(/el número de identificación es obligatorio/i)).toBeInTheDocument()
      })
    })

    it('muestra error si nombre está vacío', async () => {
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
      await waitFor(() => {
        expect(screen.getByText(/el nombre completo es obligatorio/i)).toBeInTheDocument()
      })
    })

    it('muestra error si nombre tiene solo una palabra', async () => {
      await renderComponent()
      fireEvent.change(screen.getByLabelText(/nombre completo/i), {
        target: { name: 'fullName', value: 'Juan' },
      })
      fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
      await waitFor(() => {
        expect(screen.getByText(/ingrese al menos nombre y apellido/i)).toBeInTheDocument()
      })
    })

    it('muestra error si email está vacío', async () => {
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
      await waitFor(() => {
        expect(screen.getByText(/el correo electrónico es obligatorio/i)).toBeInTheDocument()
      })
    })

    it('muestra error si contraseña tiene menos de 8 caracteres', async () => {
      await renderComponent()
      fireEvent.change(screen.getByLabelText(/contraseña/i), {
        target: { name: 'password', value: 'abc' },
      })
      fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
      await waitFor(() => {
        expect(screen.getByText(/mínimo 8 caracteres/i)).toBeInTheDocument()
      })
    })

    it('muestra error si contraseña está vacía', async () => {
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
      await waitFor(() => {
        expect(screen.getByText(/mínimo 8 caracteres/i)).toBeInTheDocument()
      })
    })

    it('muestra error si no acepta los términos', async () => {
      await renderComponent()
      fillForm({ acceptTerms: false })
      fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
      await waitFor(() => {
        expect(screen.getByText(/debe aceptar los términos/i)).toBeInTheDocument()
      })
    })

    it('no llama a register si hay errores de validación', async () => {
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
      expect(mockRegister).not.toHaveBeenCalled()
    })
  })

  //  Envío exitoso 

  describe('Envío exitoso', () => {
    it('llama a register con los datos correctos', async () => {
      mockRegister.mockResolvedValue({ success: true })
      await renderComponent()
      fillForm()
      fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(
          expect.objectContaining({
            email: 'juan@saludya.com',
            password: 'Segura@123',
            identification: '123456789',
            phone: '3001234567',
            name: 'Juan',
            lastName: 'Pérez',
            nombreCompleto: 'Juan Pérez',
          }),
        )
      })
    })

    it('navega a /login con mensaje de éxito tras registro', async () => {
      mockRegister.mockResolvedValue({ success: true })
      await renderComponent()
      fillForm()
      fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          '/login',
          expect.objectContaining({
            state: expect.objectContaining({
              successMessage: expect.stringContaining('Registro exitoso'),
            }),
          }),
        )
      })
    })

    it('separa correctamente nombre y apellido con múltiples palabras', async () => {
      mockRegister.mockResolvedValue({ success: true })
      await renderComponent()
      fillForm({ fullName: 'María José López Ramos' })
      fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'María',
            lastName: 'José López Ramos',
            nombreCompleto: 'María José López Ramos',
          }),
        )
      })
    })
  })

  //  Estado de carga 

  describe('Estado de carga', () => {
    it('muestra "Registrando..." mientras se procesa', async () => {
      mockRegister.mockImplementation(() => new Promise(() => {})) // no resuelve
      await renderComponent()
      fillForm()
      fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /registrando/i })).toBeInTheDocument()
      })
    })

    it('deshabilita el botón mientras carga', async () => {
      mockRegister.mockImplementation(() => new Promise(() => {}))
      await renderComponent()
      fillForm()
      fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /registrando/i })).toBeDisabled()
      })
    })

    it('vuelve a habilitar el botón tras error', async () => {
      mockRegister.mockResolvedValue({ success: false, error: 'Error al registrar' })
      await renderComponent()
      fillForm()
      fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /crear cuenta/i })).not.toBeDisabled()
      })
    })
  })

  //  Error del servidor 

  describe('Error del servidor', () => {
    it('muestra error general si register falla con string', async () => {
      mockRegister.mockResolvedValue({ success: false, error: 'El correo ya está registrado.' })
      await renderComponent()
      fillForm()
      fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
      await waitFor(() => {
        expect(screen.getByText(/el correo ya está registrado/i)).toBeInTheDocument()
      })
    })

    it('muestra "Error al registrar" si error no es string', async () => {
      mockRegister.mockResolvedValue({ success: false, error: { code: 500 } })
      await renderComponent()
      fillForm()
      fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
      await waitFor(() => {
        expect(screen.getByText(/error al registrar/i)).toBeInTheDocument()
      })
    })

    it('no navega si el registro falla', async () => {
      mockRegister.mockResolvedValue({ success: false, error: 'Fallo' })
      await renderComponent()
      fillForm()
      fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled()
      })
    })
  })
})