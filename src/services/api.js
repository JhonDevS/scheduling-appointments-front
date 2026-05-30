import axios from 'axios'

import { useAuthStore } from '../store/authStore'
import { useUsersAdminStore } from '../store/usersAdminStore'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export const api = axios.create({
  baseURL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor de solicitudes - agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor de respuestas - manejar errores globalmente
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data)
    } else if (error.request) {
      console.error('Network Error:', error.request)
    } else {
      console.error('Error:', error.message)
    }
    return Promise.reject(error)
  }
)

// Mock data para desarrollo
const MOCK_USER = {
  id: 1,
  email: 'dev@saludya.com',
  nombreCompleto: 'Usuario Demo'
}

const MOCK_TOKEN = 'mock-dev-token-' + Date.now()

function formatMockNameFromEmail(email) {
  const baseName = email.split('@')[0]
  const cleanedName = baseName
    .replaceAll('"', ' ')
    .replaceAll('.', ' ')
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .trim()

  return cleanedName
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || 'Usuario Demo'
}

function createMockUser(email) {
  const fullName = formatMockNameFromEmail(email)
  return {
    id: Date.now(),
    email,
    name: fullName,
    nombreCompleto: fullName,
    role: 'patient',
    status: 'active',
  }
}

// Funciones utilitarias para auth
export const authApi = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      
      // El backend devuelve { success, message, data: { usuario, token } }
      if (response.success && response.data?.token) {
        useAuthStore.getState().setToken(response.data.token)
        useAuthStore.getState().setUser(response.data.usuario)
        return { success: true, user: response.data.usuario }
      }
      
      return { success: false, error: response.error?.message || 'Error al iniciar sesión' }
    } catch (error) {
      // Si el backend no está disponible, usar mock
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || error.response?.status === 404 || !error.response) {
        console.log('Backend no disponible, usando mock data')
        const existingUser = useUsersAdminStore.getState().users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
        const mockUser = existingUser || createMockUser(email)
        if (!existingUser) {
          useUsersAdminStore.getState().addUser(mockUser)
        }
        useAuthStore.getState().setToken(MOCK_TOKEN)
        useAuthStore.getState().setUser(mockUser)
        return { success: true, user: mockUser, isMock: true }
      }
      
      const message = error.response?.data?.error?.message || 'Credenciales inválidas'
      return { success: false, error: message }
    }
  },
  
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      if (response.data?.token) {
        return { success: true, data: response.data }
      }
      if (response.success !== false) {
        return { success: true, data: response }
      }
      return response
    } catch (error) {
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || !error.response) {
        const email = userData.email
        const name = userData.nombreCompleto || userData.name || formatMockNameFromEmail(email)
        const role = userData.role || 'patient'
        const status = userData.status || 'active'
        const existingUser = useUsersAdminStore.getState().users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
        const mockUser = existingUser || useUsersAdminStore.getState().addUser({
          email,
          name,
          nombreCompleto: name,
          role,
          status,
          phone: userData.phone || '',
          identification: userData.identification || '',
        })
        return { success: true, data: mockUser, isMock: true }
      }
      throw error
    }
  },
  
  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignorar errores
    } finally {
      useAuthStore.getState().clearAuth()
    }
  },
  
  me: async () => {
    try {
      const response = await api.get('/auth/me')
      return response.data?.usuario || response.data
    } catch {
      // Devolver el usuario persistido en la tienda o mock si no hay uno
      return useAuthStore.getState().user || MOCK_USER
    }
  },

  requestPasswordReset: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email })
      if (response.success !== false) {
        return { success: true }
      }
      return { success: false, error: response.error?.message || 'No se pudo procesar la solicitud.' }
    } catch (error) {
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || !error.response) {
        return { success: true, isMock: true }
      }
      return {
        success: false,
        error: error.response?.data?.error?.message || 'No se pudo enviar el enlace.',
      }
    }
  },

  loginWithOAuth: async ({ provider, email, name, credential }) => {
    try {
      const response = await api.post('/auth/oauth', {
        provider,
        email,
        name,
        credential,
      })
      if (response.success && response.data?.token) {
        useAuthStore.getState().setToken(response.data.token)
        useAuthStore.getState().setUser(response.data.usuario)
        return { success: true, user: response.data.usuario }
      }
      return { success: false, error: response.error?.message || 'Error al iniciar sesión social' }
    } catch (error) {
      if (
        error.code === 'ERR_NETWORK' ||
        error.code === 'ECONNREFUSED' ||
        !error.response
      ) {
        let resolvedEmail = email
        let resolvedName = name

        if (provider === 'google' && credential) {
          try {
            const payload = JSON.parse(atob(credential.split('.')[1]))
            resolvedEmail = payload.email || email
            resolvedName = payload.name || resolvedName
          } catch {
            /* usar email proporcionado */
          }
        }

        if (!resolvedEmail) {
          return { success: false, error: 'No se pudo obtener el correo de la cuenta.' }
        }

        const existingUser = useUsersAdminStore.getState().users.find((u) => u.email?.toLowerCase() === resolvedEmail.toLowerCase())
        const mockUser = existingUser || useUsersAdminStore.getState().addUser({
          email: resolvedEmail,
          name: resolvedName || formatMockNameFromEmail(resolvedEmail),
          nombreCompleto: resolvedName || formatMockNameFromEmail(resolvedEmail),
          role: 'patient',
          status: 'active',
          authProvider: provider,
        })
        useAuthStore.getState().setToken(`${MOCK_TOKEN}-${provider}`)
        useAuthStore.getState().setUser(mockUser)
        return { success: true, user: mockUser, isMock: true }
      }
      const message = error.response?.data?.error?.message || 'Error al iniciar sesión social'
      return { success: false, error: message }
    }
  },
}

export default api