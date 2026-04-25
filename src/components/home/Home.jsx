import './css/Home.css'

import { useNavigate } from 'react-router-dom'

import { Button } from '../../design-system/components/Button'
import { useAuth } from '../../hooks'

function Home() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">¡Hola {user?.email}!</h1>
        <p className="home-subtitle">Bienvenido a SaludYa</p>
        <div className="home-actions">
          <Button variant="secondary" onClick={() => navigate('/calendar')}>
            Ir al Calendario
          </Button>
          <Button variant="primary" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Home