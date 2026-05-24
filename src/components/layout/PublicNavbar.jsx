import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../../hooks'

const LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/#servicios', label: 'Servicios' },
  { to: '/#doctores', label: 'Doctores' },
  { to: '/#acerca', label: 'Acerca de' },
]

export default function PublicNavbar({ activePath }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const current = activePath ?? location.pathname

  const handleGoBack = () => {
    navigate('/')
  }

  return (
    <header className="sy-navbar sy-navbar--light">
      <Link to="/" className="sy-logo">
        Salud<span>Ya</span>
      </Link>

      <nav className="sy-nav-links" aria-label="Principal">
        {LINKS.map((link) => (
          <a
            key={link.to}
            href={link.to}
            className={current === link.to ? 'is-active' : ''}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="sy-nav-actions">
        <button type="button" className="sy-btn sy-btn--ghost" onClick={handleGoBack}>
          ← Volver
        </button>
        {isAuthenticated ? (
          <button type="button" className="sy-btn sy-btn--primary" onClick={() => navigate('/dashboard')}>
            Ir al panel
          </button>
        ) : (
          <>
            <button type="button" className="sy-btn sy-btn--ghost" onClick={() => navigate('/login')}>
              Iniciar sesión
            </button>
            <button type="button" className="sy-btn sy-btn--primary" onClick={() => navigate('/register')}>
              Registrarse
            </button>
          </>
        )}
      </div>
    </header>
  )
}
