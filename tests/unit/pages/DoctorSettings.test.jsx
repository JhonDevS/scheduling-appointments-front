import { fireEvent, render, screen, waitFor, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mocks globales

const mockSetNotifyEmail = vi.fn()
const mockSetNotifySms   = vi.fn()
const mockUseAuthStore   = vi.fn()

vi.mock('../../../src/store/authStore', () => ({
  useAuthStore: (selector) => mockUseAuthStore(selector),
}))

// Helper 

function setupMocks({
  nombreCompleto = 'Dr. Martínez',
  notifyEmail    = true,
  notifySms      = false,
} = {}) {
  mockUseAuthStore.mockImplementation((selector) =>
    selector({
      user:           { nombreCompleto },
      notifyEmail,
      notifySms,
      setNotifyEmail: mockSetNotifyEmail,
      setNotifySms:   mockSetNotifySms,
    }),
  )
}

async function renderComponent() {
  const { default: DoctorSettings } = await import('../../../src/pages/DoctorSettings')
  return render(<DoctorSettings />)
}

// Tests 

describe('DoctorSettings', () => {

  beforeEach(() => {
    vi.resetModules()
    mockSetNotifyEmail.mockReset()
    mockSetNotifySms.mockReset()
  })

  // Renderizado base 

  describe('Renderizado base', () => {
    it('muestra el título "Configuración"', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByRole('heading', { name: /configuración/i })).toBeInTheDocument()
    })

    it('muestra el nombre del usuario en el subtítulo', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByText(/preferencias del portal para dr\. martínez/i)).toBeInTheDocument()
    })

    it('muestra "su cuenta" como fallback si user es null', async () => {
      mockUseAuthStore.mockImplementation((selector) =>
        selector({
          user:           null,
          notifyEmail:    true,
          notifySms:      false,
          setNotifyEmail: mockSetNotifyEmail,
          setNotifySms:   mockSetNotifySms,
        }),
      )
      await renderComponent()
      expect(screen.getByText(/preferencias del portal para su cuenta/i)).toBeInTheDocument()
    })

    it('muestra el checkbox de notificaciones por correo', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByRole('checkbox', { name: /notificaciones por correo/i })).toBeInTheDocument()
    })

    it('muestra el checkbox de recordatorios por SMS', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByRole('checkbox', { name: /recordatorios por sms/i })).toBeInTheDocument()
    })

    it('muestra el botón "Guardar preferencias"', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.getByRole('button', { name: /guardar preferencias/i })).toBeInTheDocument()
    })
  })

  // Estado inicial de checkboxes 

  describe('Estado inicial de los checkboxes', () => {
    it('checkbox de correo aparece marcado si notifyEmail = true', async () => {
      setupMocks({ notifyEmail: true })
      await renderComponent()
      expect(screen.getByRole('checkbox', { name: /notificaciones por correo/i })).toBeChecked()
    })

    it('checkbox de correo aparece desmarcado si notifyEmail = false', async () => {
      setupMocks({ notifyEmail: false })
      await renderComponent()
      expect(screen.getByRole('checkbox', { name: /notificaciones por correo/i })).not.toBeChecked()
    })

    it('checkbox de SMS aparece desmarcado si notifySms = false', async () => {
      setupMocks({ notifySms: false })
      await renderComponent()
      expect(screen.getByRole('checkbox', { name: /recordatorios por sms/i })).not.toBeChecked()
    })

    it('checkbox de SMS aparece marcado si notifySms = true', async () => {
      setupMocks({ notifySms: true })
      await renderComponent()
      expect(screen.getByRole('checkbox', { name: /recordatorios por sms/i })).toBeChecked()
    })
  })

  // Interacción con checkboxes

  describe('Interacción con checkboxes', () => {
    it('llama a setNotifyEmail(false) al desmarcar el checkbox de correo', async () => {
      setupMocks({ notifyEmail: true })
      await renderComponent()
      fireEvent.click(screen.getByRole('checkbox', { name: /notificaciones por correo/i }))
      expect(mockSetNotifyEmail).toHaveBeenCalledWith(false)
    })

    it('llama a setNotifyEmail(true) al marcar el checkbox de correo', async () => {
      setupMocks({ notifyEmail: false })
      await renderComponent()
      fireEvent.click(screen.getByRole('checkbox', { name: /notificaciones por correo/i }))
      expect(mockSetNotifyEmail).toHaveBeenCalledWith(true)
    })

    it('llama a setNotifySms(true) al marcar el checkbox de SMS', async () => {
      setupMocks({ notifySms: false })
      await renderComponent()
      fireEvent.click(screen.getByRole('checkbox', { name: /recordatorios por sms/i }))
      expect(mockSetNotifySms).toHaveBeenCalledWith(true)
    })

    it('llama a setNotifySms(false) al desmarcar el checkbox de SMS', async () => {
      setupMocks({ notifySms: true })
      await renderComponent()
      fireEvent.click(screen.getByRole('checkbox', { name: /recordatorios por sms/i }))
      expect(mockSetNotifySms).toHaveBeenCalledWith(false)
    })
  })

  // Guardar preferencias 

  describe('Guardar preferencias', () => {
    it('muestra "Preferencias guardadas." al hacer clic en guardar', async () => {
      setupMocks()
      await renderComponent()
      fireEvent.click(screen.getByRole('button', { name: /guardar preferencias/i }))
      expect(screen.getByText(/preferencias guardadas/i)).toBeInTheDocument()
    })

    it('oculta el mensaje de éxito tras 3 segundos', async () => {
      setupMocks()
      await renderComponent()
      vi.useFakeTimers()
      fireEvent.click(screen.getByRole('button', { name: /guardar preferencias/i }))
      expect(screen.getByText(/preferencias guardadas/i)).toBeInTheDocument()
      act(() => vi.advanceTimersByTime(3000))
      expect(screen.queryByText(/preferencias guardadas/i)).not.toBeInTheDocument()
      vi.useRealTimers()
    })

    it('el mensaje de éxito no aparece antes de guardar', async () => {
      setupMocks()
      await renderComponent()
      expect(screen.queryByText(/preferencias guardadas/i)).not.toBeInTheDocument()
    })

    it('puede guardar varias veces mostrando el mensaje cada vez', async () => {
      setupMocks()
      await renderComponent()
      vi.useFakeTimers()
      const btn = screen.getByRole('button', { name: /guardar preferencias/i })

      fireEvent.click(btn)
      expect(screen.getByText(/preferencias guardadas/i)).toBeInTheDocument()

      act(() => vi.advanceTimersByTime(3000))
      expect(screen.queryByText(/preferencias guardadas/i)).not.toBeInTheDocument()

      fireEvent.click(btn)
      expect(screen.getByText(/preferencias guardadas/i)).toBeInTheDocument()
      vi.useRealTimers()
    })
  })
})