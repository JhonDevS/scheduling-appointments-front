import './styles/saludya.css'

import { Navigate, Route, Routes } from 'react-router-dom'

import { AuthProvider, useAuth } from './hooks'
import AdminAvailability from './pages/AdminAvailability'
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



function ProtectedRoute({ children, allowedRoles }) {

  const { isAuthenticated, isLoading, user } = useAuth()



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



  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const roles = (user?.roles && Array.isArray(user.roles) && user.roles.length)
      ? user.roles
      : (user?.role ? [user.role] : [])

    const hasRole = roles.some((r) => allowedRoles.includes(r))

    if (!hasRole) {
      // Redirigir según el rol actual del usuario, o al inicio por defecto
      if (roles.includes('admin')) return <Navigate to="/admin" replace />
      if (roles.includes('doctor')) return <Navigate to="/doctor" replace />
      if (roles.includes('patient')) return <Navigate to="/dashboard" replace />
      return <Navigate to="/" replace />
    }
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

          <ProtectedRoute allowedRoles={['patient']}>

            <PatientDashboard />

          </ProtectedRoute>

        }

      />



      <Route

        path="/profile"

        element={

          <ProtectedRoute allowedRoles={['patient']}>

            <ProfilePage />

          </ProtectedRoute>

        }

      />



      <Route

        path="/doctor"

        element={

          <ProtectedRoute allowedRoles={['doctor']}>

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

          <ProtectedRoute allowedRoles={['admin']}>

            <AdminUsers />

          </ProtectedRoute>

        }

      />

      <Route
        path="/admin/availability"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminAvailability />
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
