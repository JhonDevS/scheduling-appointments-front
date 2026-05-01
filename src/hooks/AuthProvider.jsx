import { useEffect, useState } from 'react'

import { authApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const token = useAuthStore((state) => state.token)
  const setToken = useAuthStore((state) => state.setToken)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  useEffect(() => {
    let mounted = true
    
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await authApi.me()
          if (mounted) {
            setUser(userData)
          }
        } catch {
          if (mounted) {
            clearAuth()
          }
        }
      }
      if (mounted) {
        setIsLoading(false)
      }
    }
    
    initAuth()
    
    return () => {
      mounted = false
    }
  }, [token, clearAuth, setToken])

  const login = async (email, password) => {
    try {
      const result = await authApi.login(email, password)
      
      return result
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Error al iniciar sesión'
      return { success: false, error: message }
    }
  }
  const register = async (userData) => {
    try {
      const result = await authApi.register(userData)
      
      if (result.success === true) {
        const user = result.data || result
        return { success: true, user, message: result.message }
      }
      if (result.isMock) {
        const mockUser = { email: userData.email, nombreCompleto: `${userData.nombreCompleto}` }
        setUser(mockUser)
        return { success: true, user: mockUser, isMock: true }
      }
      return { success: false, error: result.error?.message || result.message || 'Error al registrar' }
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Error al registrar usuario'
      return { success: false, error: message }
    }
  }   
  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Ignorar errores
    }
    setUser(null)
  }

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}