import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../../hooks'

const LINKS = [
  { to: '/dashboard', label: 'Inicio', path: '/dashboard' },
  { to: '/#servicios', label: 'Servicios', path: null },
  { to: '/#doctores', label: 'Doctores', path: null },
  { to: '/appointments', label: 'Citas', path: '/appointments' },
  { to: '/#acerca', label: 'Acerca de', path: null },
]

export default function AppNavbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/dashboard')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sy-navbar sy-navbar--app">
      <Link to="/dashboard" className="sy-logo sy-logo--blue">
        Salud<span>Ya</span>
      </Link>

      <nav className="sy-nav-links sy-nav-links--dark" aria-label="Principal">
        {LINKS.map((link) => (
          <Link
            key={link.label}
            to={link.to}
            className={link.path && location.pathname === link.path ? 'is-active' : ''}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="sy-nav-actions">
        <button type="button" className="sy-btn sy-btn--ghost-dark" onClick={handleGoBack}>
          ← Volver
        </button>
        <button type="button" className="sy-btn sy-btn--ghost-dark" onClick={() => navigate('/profile')}>
          Perfil
        </button>
        <button type="button" className="sy-btn sy-btn--ghost-dark" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}
