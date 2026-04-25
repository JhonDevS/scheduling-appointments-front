import { useState } from 'react'

import { AuthContext } from './AuthContext'

// Mock de usuario
const MOCK_USER = {
  email: 'admin@saludya.com',
  password: '123456'
}

const getStoredUser = () => {
  if (typeof window === 'undefined') return null
  const stored = sessionStorage.getItem('user')
  return stored ? JSON.parse(stored) : null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())
  const isAuthenticated = user !== null

  const login = (email, password) => {
    if (email === MOCK_USER.email && password === MOCK_USER.password) {
      const userData = { email }
      sessionStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      return { success: true }
    }
    return { success: false, error: 'Credenciales inválidas' }
  }

  const logout = () => {
    sessionStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading: false, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export { MOCK_USER }