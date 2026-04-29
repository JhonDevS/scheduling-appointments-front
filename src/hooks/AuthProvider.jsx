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
  const [users, setUsers] = useState([MOCK_USER])
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
  const register = (userData) => {          
    const exists = users.find(u => u.email === userData.email)
    if (exists) {
      return { success: false, error: 'Este usuario ya se ha registrado' }
    }
    const newUser = { email: userData.email, password: userData.password }
    setUsers([...users, newUser])
    const userSession = { email: userData.email }
    sessionStorage.setItem('user', JSON.stringify(userSession))
    setUser(userSession)
    return { success: true }
  }   
  const logout = () => {
    sessionStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading: false, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export { MOCK_USER }