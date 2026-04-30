import axios from 'axios'

import { useAuthStore } from '../store/authStore'

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
        useAuthStore.getState().setToken(MOCK_TOKEN)
        useAuthStore.getState().setUser(MOCK_USER)
        return { success: true, user: MOCK_USER, isMock: true }
      }
      
      const message = error.response?.data?.error?.message || 'Credenciales inválidas'
      return { success: false, error: message }
    }
  },
  
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      return response
    } catch (error) {
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || !error.response) {
        return { success: true, message: 'Registro simulado (mock)', isMock: true }
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
      // Devolver mock user si falla
      return MOCK_USER
    }
  },
}

export default api