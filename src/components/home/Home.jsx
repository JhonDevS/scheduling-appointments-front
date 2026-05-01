import './css/Home.css'

import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../hooks'
import Calendar from '../calendar/Calendar'

function Home() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const upcomingAppointments = [
    { day: 'Lunes 5', time: '10:00 AM', specialty: 'Medicina General' },
    { day: 'Jueves 8', time: '3:30 PM', specialty: 'Cardiología' },
  ]

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="header-logo">SaludYa</h1>
        <div className="header-actions">
          <a href="#" className="header-link" onClick={(e) => { e.preventDefault(); navigate('/calendar') }}>
            Calendario
          </a>
          <span className="header-divider">|</span>
          <a href="#" className="header-link" onClick={(e) => { e.preventDefault(); handleLogout() }}>
            Cerrar sesión
          </a>
        </div>
      </header>
      <main className="home-main">
        <div className="home-layout">
          <div className="home-content">
            <div className="text-home-content">
              <h2 className="welcome-title">¡Bienvenido de nuevo, {user?.nombreCompleto || user?.email}!</h2>
              <p className="welcome-description">
                Nos alegra tenerte aquí. En esta sección puedes visualizar tu calendario de citas médicas 
                y mantener un control total sobre tus próximas consultas. ¿Necesitas agendar una nueva cita? 
                Simplemente selecciona una fecha disponible en el calendario y reserva tu horario preferido. 
                Tu salud es nuestra prioridad.
              </p>
            </div>
            <div className="calendar-section">
              <Calendar />
            </div>
          </div>
          <aside className="home-sidebar">
            <div className="appointments-card">
              <h3 className="appointments-title">Próximas Citas</h3>
              <div className="appointments-list">
                {upcomingAppointments.map((apt, index) => (
                  <div key={index} className="appointment-item">
                    <div className="appointment-day">{apt.day}</div>
                    <div className="appointment-time">{apt.time}</div>
                    <div className="appointment-specialty">{apt.specialty}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default Home