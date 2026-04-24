import './App.css'

import { Navigate,Route, Routes } from 'react-router-dom'

import Home from './components/Home'
import Login from './components/Login'

const MOCK_USER = 'admin@saludya.com'
const MOCK_PASSWORD = '123456'

function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export { MOCK_PASSWORD,MOCK_USER }
export default App