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
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}