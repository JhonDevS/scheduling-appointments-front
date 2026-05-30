import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { authApi, api } from '../../../src/services/api'
import { useAuthStore } from '../../../src/store/authStore'
import { useUsersAdminStore } from '../../../src/store/usersAdminStore'
import { resetAuthStore, resetUsersAdminStore } from '../../helpers/store'

describe('authApi', () => {
  beforeEach(() => {
    resetAuthStore()
    resetUsersAdminStore()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loginWithOAuth guarda usuario en modo mock sin backend', async () => {
    const result = await authApi.loginWithOAuth({
      provider: 'google',
      email: 'paciente@gmail.com',
      name: 'Paciente Gmail',
    })

    expect(result.success).toBe(true)
    expect(useAuthStore.getState().user?.email).toBe('paciente@gmail.com')
    expect(useAuthStore.getState().user?.nombreCompleto).toBe('Paciente Gmail')
    expect(useAuthStore.getState().token).toBeTruthy()
  })

  it('login usa mock cuando el backend no responde', async () => {
    const result = await authApi.login('dev@saludya.com', 'cualquier-password')

    expect(result.success).toBe(true)
    expect(result.user?.email).toBe('dev@saludya.com')
  })

  it('requestPasswordReset responde en modo mock sin backend', async () => {
    const result = await authApi.requestPasswordReset('user@saludya.com')
    expect(result.success).toBe(true)
  })

  it('crea un paciente en usersAdminStore cuando el backend no está disponible', async () => {
    vi.spyOn(api, 'post').mockRejectedValue({ code: 'ERR_NETWORK' })

    const result = await authApi.register({
      email: 'nuevo@paciente.com',
      password: 'Test1234!',
      nombreCompleto: 'Paciente Nuevo',
      phone: '+571234567890',
      identification: '1234567890',
    })

    expect(result.success).toBe(true)
    expect(result.isMock).toBe(true)
    expect(useUsersAdminStore.getState().users.some((u) => u.email === 'nuevo@paciente.com')).toBe(true)
    expect(useAuthStore.getState().user?.email).toBe('nuevo@paciente.com')
  })

  it('logout limpia el almacén de autenticación', async () => {
    await authApi.loginWithOAuth({
      provider: 'microsoft',
      email: 'user@hotmail.com',
      name: 'Usuario Hotmail',
    })

    await authApi.logout()

    expect(useAuthStore.getState().token).toBeNull()
    expect(useAuthStore.getState().user).toBeNull()
  })
})
