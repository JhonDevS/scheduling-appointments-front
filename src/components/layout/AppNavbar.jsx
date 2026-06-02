import { useEffect, useRef, useState } from 'react'
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
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const userMenuRef = useRef(null)
  const navRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
      if (navRef.current && !navRef.current.contains(event.target)) {
        setMobileNavOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

      <button
        type="button"
        className="sy-navbar__toggle"
        aria-label="Abrir menú de navegación"
        aria-expanded={mobileNavOpen}
        onClick={() => setMobileNavOpen((open) => !open)}
      >
        ☰
      </button>

      <nav
        ref={navRef}
        className={`sy-nav-links sy-nav-links--dark ${mobileNavOpen ? 'is-open' : ''}`}
        aria-label="Principal"
      >
        {LINKS.map((link) => (
          <Link
            key={link.label}
            to={link.to}
            className={link.path && location.pathname === link.path ? 'is-active' : ''}
            onClick={() => setMobileNavOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="sy-nav-actions">
        <button type="button" className="sy-btn sy-btn--ghost-dark" onClick={handleGoBack}>
          ← Volver
        </button>
        <div className="sy-user-menu" ref={userMenuRef}>
          <button
            type="button"
            className="sy-user-avatar-btn"
            aria-expanded={userMenuOpen}
            aria-label="Abrir menú de usuario"
            onClick={() => setUserMenuOpen((open) => !open)}
          >
            <span className="sy-avatar" aria-hidden="true" />
          </button>
          {userMenuOpen && (
            <div className="sy-user-menu__dropdown" role="menu">
              <button type="button" className="sy-user-menu__item" onClick={() => { setUserMenuOpen(false); navigate('/profile') }}>
                Perfil
              </button>
              <button type="button" className="sy-user-menu__item" onClick={() => { setUserMenuOpen(false); handleLogout() }}>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
