import { vi } from 'vitest'

import { useAuthStore } from '../../../src/store/authStore'

export const mockUser = {
  id: 1,
  email: 'paciente@saludya.com',
  nombreCompleto: 'Paciente Prueba',
}

function applySession() {
  useAuthStore.getState().setToken('integration-test-token')
  useAuthStore.getState().setUser(mockUser)
}

export function createAuthApiMock() {
  return {
    me: vi.fn().mockImplementation(async () => {
      if (useAuthStore.getState().token) {
        return mockUser
      }
      throw new Error('Sin sesión')
    }),
    login: vi.fn().mockImplementation(async () => {
      applySession()
      return { success: true, user: mockUser }
    }),
    logout: vi.fn().mockImplementation(async () => {
      useAuthStore.getState().clearAuth()
    }),
    register: vi.fn().mockResolvedValue({ success: true, isMock: true }),
    loginWithOAuth: vi.fn().mockImplementation(async () => {
      applySession()
      return { success: true, user: mockUser }
    }),
    requestPasswordReset: vi.fn().mockResolvedValue({ success: true, isMock: true }),
  }
}
