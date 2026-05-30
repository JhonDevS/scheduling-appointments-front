import { Navigate, Route, Routes } from 'react-router-dom'



import './styles/saludya.css'



import { AuthProvider, useAuth } from './hooks'

import AdminUsers from './pages/AdminUsers'

import BookAppointment from './pages/BookAppointment'

import DoctorAnalytics from './pages/DoctorAnalytics'
import DoctorAppointments from './pages/DoctorAppointments'
import DoctorCalendar from './pages/DoctorCalendar'
import DoctorDashboard from './pages/DoctorDashboard'
import DoctorPortal from './pages/DoctorPortal'
import DoctorSettings from './pages/DoctorSettings'
import DoctorUsers from './pages/DoctorUsers'
import ForgotPasswordPage from './pages/ForgotPasswordPage'

import Landing from './pages/Landing'

import LegalPage from './pages/LegalPage'

import LoginPage from './pages/LoginPage'

import MyAppointments from './pages/MyAppointments'

import PatientDashboard from './pages/PatientDashboard'

import ProfilePage from './pages/ProfilePage'

import RegisterPage from './pages/RegisterPage'



function PublicRoute({ children }) {

  const { isAuthenticated, isLoading } = useAuth()



  if (!isLoading && isAuthenticated) {

    return <Navigate to="/dashboard" replace />

  }



  return children

}



function ProtectedRoute({ children }) {

  const { isAuthenticated, isLoading } = useAuth()



  if (isLoading) {

    return (

      <div className="pantalla-carga">

        <div className="spinner" />

        <p>Cargando plataforma médica...</p>

      </div>

    )

  }



  if (!isAuthenticated) {

    return <Navigate to="/login" replace />

  }



  return children

}



function AppRoutes() {

  return (

    <Routes>

      <Route path="/" element={<Landing />} />



      <Route

        path="/register"

        element={

          <PublicRoute>

            <RegisterPage />

          </PublicRoute>

        }

      />



      <Route

        path="/login"

        element={

          <PublicRoute>

            <LoginPage />

          </PublicRoute>

        }

      />



      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route path="/legal/:slug" element={<LegalPage />} />



      <Route

        path="/book"

        element={

          <ProtectedRoute>

            <BookAppointment />

          </ProtectedRoute>

        }

      />



      <Route

        path="/appointments"

        element={

          <ProtectedRoute>

            <MyAppointments />

          </ProtectedRoute>

        }

      />



      <Route

        path="/dashboard"

        element={

          <ProtectedRoute>

            <PatientDashboard />

          </ProtectedRoute>

        }

      />



      <Route

        path="/profile"

        element={

          <ProtectedRoute>

            <ProfilePage />

          </ProtectedRoute>

        }

      />



      <Route

        path="/doctor"

        element={

          <ProtectedRoute>

            <DoctorPortal />

          </ProtectedRoute>

        }

      >

        <Route index element={<DoctorDashboard />} />

        <Route path="calendar" element={<DoctorCalendar />} />

        <Route path="appointments" element={<DoctorAppointments />} />

        <Route path="users" element={<DoctorUsers />} />

        <Route path="analytics" element={<DoctorAnalytics />} />

        <Route path="settings" element={<DoctorSettings />} />

      </Route>



      <Route

        path="/admin"

        element={

          <ProtectedRoute>

            <AdminUsers />

          </ProtectedRoute>

        }

      />



      <Route path="/home" element={<Navigate to="/dashboard" replace />} />

      <Route path="/calendar" element={<Navigate to="/book" replace />} />



      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>

  )

}



function App() {

  return (

    <AuthProvider>

      <div className="app-container">

        <AppRoutes />

      </div>

    </AuthProvider>

  )

}



export default App

