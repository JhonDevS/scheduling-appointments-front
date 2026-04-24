import './css/Home.css'

import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../hooks'

function Home() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">¡Hola {user?.email}!</h1>
        <p className="home-subtitle">Bienvenido a SaludYa</p>
        <div className="home-actions">
          <button className="nav-btn" onClick={() => navigate('/calendar')}>
            Ir al Calendario
          </button>
          <button className="logout-btn" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home