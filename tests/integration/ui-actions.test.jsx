import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { createAuthApiMock } from './mocks/authApi.mock'
import { renderApp } from '../helpers/test-utils'
import {
  resetAuthStore,
  resetNewsletterStore,
  resetPrescriptionRenewalsStore,
  resetUsersAdminStore,
  seedAuthenticatedUser,
} from '../helpers/store'

vi.mock('../../src/services/api', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, authApi: createAuthApiMock() }
})

describe('Integración — acciones UI ampliadas', () => {
  it('muestra error de newsletter sin correo', async () => {
    const user = userEvent.setup()
    resetAuthStore()
    resetNewsletterStore()
    renderApp('/')
    await user.click(screen.getByRole('button', { name: /comenzar/i }))
    expect(await screen.findByText(/ingrese su correo/i)).toBeInTheDocument()
  })

  it('descarga historial y alterna vista completa en citas', async () => {
    const user = userEvent.setup()
    seedAuthenticatedUser()
    renderApp('/appointments')
    await screen.findByRole('heading', { name: /mis citas/i })
    await user.click(screen.getByRole('button', { name: /descargar historial/i }))
    await user.click(screen.getByRole('button', { name: /ver historial completo/i }))
    expect(screen.getByRole('button', { name: /ver vista filtrada/i })).toBeInTheDocument()
  })

  it('panel paciente: detalles, recetas e informe', async () => {
    const user = userEvent.setup()
    seedAuthenticatedUser()
    resetPrescriptionRenewalsStore()
    renderApp('/dashboard')
    await screen.findByRole('heading', { name: /buenos días/i })
    await user.click(screen.getByRole('button', { name: /ver detalles/i }))
    expect(screen.getByText(/consultorio 204/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /ver todas/i }))
    expect(screen.getByRole('button', { name: /ver menos/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /informe completo/i }))
  })

  it('admin: edita usuario y valida formulario', async () => {
    const user = userEvent.setup()
    seedAuthenticatedUser()
    resetUsersAdminStore()
    renderApp('/admin')
    await screen.findByRole('heading', { name: /gestión de usuarios/i })
    const [editBtn] = screen.getAllByRole('button', { name: /^editar /i })
    await user.click(editBtn)
    await user.clear(screen.getByLabelText(/^nombre$/i))
    await user.click(screen.getByRole('button', { name: /^guardar$/i }))
    expect(await screen.findByText(/obligatorios/i)).toBeInTheDocument()
  })

  it('admin: elimina usuario confirmado', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    seedAuthenticatedUser()
    resetUsersAdminStore()
    renderApp('/admin')
    await screen.findByRole('heading', { name: /gestión de usuarios/i })
    await user.selectOptions(screen.getByLabelText(/filtrar por estado/i), 'suspended')
    await user.click(screen.getByRole('button', { name: /eliminar marcus thorne/i }))
    await waitFor(() => {
      expect(screen.queryByText(/marcus thorne/i)).not.toBeInTheDocument()
    })
    vi.restoreAllMocks()
  })

  it('doctor: vista semana y búsqueda', async () => {
    const user = userEvent.setup()
    seedAuthenticatedUser()
    renderApp('/doctor')
    await screen.findByRole('heading', { name: /buenos días, elena/i })
    await user.click(screen.getByRole('button', { name: /^semana$/i }))
    await user.type(screen.getByLabelText(/buscar pacientes/i), 'sofía')
    expect(screen.getByText(/sofía loren/i)).toBeInTheDocument()
  })

  it('perfil rechaza campos vacíos', async () => {
    const user = userEvent.setup()
    seedAuthenticatedUser()
    renderApp('/profile')
    await screen.findByRole('heading', { name: /mi perfil/i })
    await user.clear(screen.getByLabelText(/nombre completo/i))
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }))
    expect(await screen.findByText(/complete nombre/i)).toBeInTheDocument()
  })

  it('forgot password valida correo vacío', async () => {
    const user = userEvent.setup()
    renderApp('/forgot-password')
    await user.click(screen.getByRole('button', { name: /enviar enlace/i }))
    expect(await screen.findByText(/ingrese su correo/i)).toBeInTheDocument()
  })
})
