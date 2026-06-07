import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

//  Mocks globales 

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('../../../src/components/layout/AppNavbar', () => ({
  default: () => <nav data-testid="app-navbar" />,
}))
vi.mock('../../../src/components/layout/AppFooter', () => ({
  default: () => <footer data-testid="app-footer" />,
}))

const mockUseAuth = vi.fn()
vi.mock('../../../src/hooks', () => ({
  useAuth: () => mockUseAuth(),
}))

const mockSetUser = vi.fn()
vi.mock('../../../src/store/authStore', () => ({
  useAuthStore: {
    getState: () => ({ setUser: mockSetUser }),
  },
}))

// Helper 

function setupMocks({ nombreCompleto = 'Ana Gómez', email = 'ana@saludya.com' } = {}) {
  mockUseAuth.mockReturnValue({ user: { nombreCompleto, email } })
}

async function renderComponent() {
  const { default: ProfilePage } = await import('../../../src/pages/ProfilePage')
  return render(<ProfilePage />)
}

//  Tests 

describe('ProfilePage', () => {

  beforeEach(() => {
    vi.resetModules()
    mockNavigate.mockReset()
    mockSetUser.mockReset()
  })

  //  Renderizado base 

  describe('Renderizado base', () => {
    it('renderiza el navbar y el footer', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByTestId('app-navbar')).toBeInTheDocument()
      expect(screen.getByTestId('app-footer')).toBeInTheDocument()
    })

    it('muestra el título "Mi perfil"', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByRole('heading', { name: /mi perfil/i })).toBeInTheDocument()
    })

    it('muestra el kicker "Cuenta"', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByText('Cuenta')).toBeInTheDocument()
    })

    it('muestra el botón "Guardar cambios"', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByRole('button', { name: /guardar cambios/i })).toBeInTheDocument()
    })

    it('muestra el botón "Cancelar"', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
    })
  })

  //  Valores iniciales 

  describe('Valores iniciales del formulario', () => {
    it('precarga el nombre completo del usuario', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByLabelText(/nombre completo/i)).toHaveValue('Ana Gómez')
    })

    it('precarga el correo electrónico del usuario', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByLabelText(/correo electrónico/i)).toHaveValue('ana@saludya.com')
    })

    it('precarga campos vacíos si user es null', async () => {
      mockUseAuth.mockReturnValue({ user: null })
      await renderComponent()
      expect(screen.getByLabelText(/nombre completo/i)).toHaveValue('')
      expect(screen.getByLabelText(/correo electrónico/i)).toHaveValue('')
    })
  })

  //  Interacción con campos 

  describe('Edición de campos', () => {
    it('actualiza el valor del campo nombre al escribir', async () => {
      setupMocks()
      await renderComponent()
      const input = screen.getByLabelText(/nombre completo/i)
      fireEvent.change(input, { target: { value: 'Carlos Ruiz' } })
      expect(input).toHaveValue('Carlos Ruiz')
    })

    it('actualiza el valor del campo email al escribir', async () => {
      setupMocks()
      await renderComponent()
      const input = screen.getByLabelText(/correo electrónico/i)
      fireEvent.change(input, { target: { value: 'carlos@saludya.com' } })
      expect(input).toHaveValue('carlos@saludya.com')
    })
  })

  //  Guardar cambios 

  describe('Guardar cambios', () => {
    it('llama a setUser con los datos actualizados al guardar', async () => {
      setupMocks()
      await renderComponent()

      fireEvent.change(screen.getByLabelText(/nombre completo/i), {
        target: { value: 'Carlos Ruiz' },
      })
      fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
        target: { value: 'carlos@saludya.com' },
      })
      fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }))

      expect(mockSetUser).toHaveBeenCalledWith(
        expect.objectContaining({
          nombreCompleto: 'Carlos Ruiz',
          email: 'carlos@saludya.com',
        }),
      )
    })

    it('muestra mensaje de éxito al guardar correctamente', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }))
      await waitFor(() => {
        expect(screen.getByText(/perfil actualizado correctamente/i)).toBeInTheDocument()
      })
    })

    it('recorta espacios en blanco al guardar nombre y email', async () => {
      setupMocks()
      await renderComponent()

      fireEvent.change(screen.getByLabelText(/nombre completo/i), {
        target: { value: '  Ana Gómez  ' },
      })
      fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
        target: { value: '  ana@saludya.com  ' },
      })
      fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }))

      expect(mockSetUser).toHaveBeenCalledWith(
        expect.objectContaining({
          nombreCompleto: 'Ana Gómez',
          email: 'ana@saludya.com',
        }),
      )
    })

    it('conserva los demás campos del usuario al actualizar', async () => {
      mockUseAuth.mockReturnValue({
        user: { nombreCompleto: 'Ana Gómez', email: 'ana@saludya.com', role: 'patient', id: '42' },
      })
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }))

      expect(mockSetUser).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'patient', id: '42' }),
      )
    })
  })

  //  Validaciar el form

  describe('Validación del formulario', () => {
    it('muestra error si el nombre está vacío', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.change(screen.getByLabelText(/nombre completo/i), { target: { value: '' } })
      fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }))
      await waitFor(() => {
        expect(screen.getByText(/complete nombre y correo/i)).toBeInTheDocument()
      })
    })

    it('muestra error si el email está vacío', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: '' } })
      fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }))
      await waitFor(() => {
        expect(screen.getByText(/complete nombre y correo/i)).toBeInTheDocument()
      })
    })

    it('muestra error si el nombre es solo espacios', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.change(screen.getByLabelText(/nombre completo/i), { target: { value: '   ' } })
      fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }))
      await waitFor(() => {
        expect(screen.getByText(/complete nombre y correo/i)).toBeInTheDocument()
      })
    })

    it('no llama a setUser si la validación falla', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.change(screen.getByLabelText(/nombre completo/i), { target: { value: '' } })
      fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }))
      expect(mockSetUser).not.toHaveBeenCalled()
    })
  })

  //  Navegación 

  describe('Navegación', () => {
    it('"Cancelar" navega a /dashboard', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })
})