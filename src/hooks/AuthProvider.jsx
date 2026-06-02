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

  const login = async (email, password, requiredRole = 'patient') => {
    try {
      const result = await authApi.login(email, password, requiredRole)

      if (result.success && result.user) {
        setUser(result.user)
      }

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
        return result
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

  const loginWithOAuth = async (payload, requiredRole = 'patient') => {
    try {
      const result = await authApi.loginWithOAuth({ ...payload, requiredRole })
      if (result.success && result.user) {
        setUser(result.user)
      }
      return result
    } catch {
      return { success: false, error: 'Error al iniciar sesión con el proveedor seleccionado' }
    }
  }

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, loginWithOAuth, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  )
}