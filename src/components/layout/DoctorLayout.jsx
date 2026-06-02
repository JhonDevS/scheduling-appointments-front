import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

import { useAuth } from '../../hooks'
import { useUsersAdminStore } from '../../store/usersAdminStore'
import HelpModal from './HelpModal'
import LegalLink from './LegalLink'
import NotificationsPanel from './NotificationsPanel'

const MENU = [
  { to: '/doctor', label: 'Panel de control', end: true },
  { to: '/doctor/calendar', label: 'Calendario' },
  { to: '/doctor/appointments', label: 'Citas' },
  { to: '/doctor/users', label: 'Gestión de pacientes' },
  { to: '/doctor/analytics', label: 'Analíticas' },
  { to: '/doctor/settings', label: 'Configuración' },
]

export default function DoctorLayout({
  children,
  portalTitle = 'PORTAL MÉDICO',
  menuItems = MENU,
  menuLabel = 'Portal médico',
  menuVariant = 'doctor',
  searchQuery = '',
  onSearchChange,
}) {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const users = useUsersAdminStore((state) => state.users)
  const [helpOpen, setHelpOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const accountMenuRef = useRef(null)
  const sidebarRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAccountMenuOpen(false)
      }
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const resolvedUser = useMemo(() => {
    const authUser = user || {}
    const storedUser = users.find(
      (u) => u.email?.toLowerCase() === authUser.email?.toLowerCase(),
    )
    return {
      ...storedUser,
      ...authUser,
    }
  }, [user, users])

  const displayRole = useMemo(() => {
    const role = (resolvedUser?.role || '').toString().trim().toLowerCase()
    if (role === 'doctor') {
      return resolvedUser?.specialty || 'Doctor'
    }
    if (role === 'admin') {
      return 'Administrador'
    }
    if (role === 'patient') {
      return 'Paciente'
    }
    return 'Usuario'
  }, [resolvedUser])

  const displayName = useMemo(
    () => resolvedUser?.nombreCompleto || resolvedUser?.name || 'Usuario autenticado',
    [resolvedUser],
  )

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/doctor')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="sy-portal">
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      {sidebarOpen && <div className="sy-portal__backdrop" onClick={() => setSidebarOpen(false)} />}
      <aside
        ref={sidebarRef}
        className={`sy-portal__sidebar sy-portal__sidebar--${menuVariant} ${sidebarOpen ? 'is-open' : ''}`}
      >
        <div className="sy-portal__sidebar-header">
          <div className="sy-portal__brand">
            <span className="sy-logo sy-logo--blue">Salud<span>Ya</span></span>
            <small>{portalTitle}</small>
          </div>
          <button
            type="button"
            className="sy-portal__sidebar-close"
            aria-label="Cerrar menú"
            onClick={() => setSidebarOpen(false)}
          >
            ×
          </button>
        </div>

        <nav className={`sy-portal__menu sy-portal__menu--${menuVariant}`} aria-label={menuLabel}>
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'is-active' : '')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sy-portal__sidebar-footer">
          <button
            type="button"
            className="sy-btn sy-btn--primary sy-btn--block"
            onClick={() => navigate('/book')}
          >
            + Nueva cita
          </button>
          <button type="button" className="sy-portal__link-btn" onClick={() => setHelpOpen(true)}>
            Ayuda
          </button>
          <button type="button" className="sy-portal__link-btn" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="sy-portal__main">
        <header className="sy-portal__topbar">
          <div className="sy-search">
            <button type="button" className="sy-btn sy-btn--ghost" onClick={handleGoBack}>
              ← Volver
            </button>
            <span aria-hidden>🔍</span>
            <input
              type="search"
              placeholder="Buscar pacientes o horarios..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              aria-label="Buscar pacientes o horarios"
            />
          </div>
          <div className="sy-portal__topbar-actions" style={{ position: 'relative' }}>
            <button
              type="button"
              className="sy-icon-btn"
              aria-label="Notificaciones"
              aria-expanded={notificationsOpen}
              onClick={() => setNotificationsOpen((v) => !v)}
            >
              🔔
            </button>
            <NotificationsPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
            <button
              type="button"
              className="sy-icon-btn"
              aria-label="Abrir menú"
              onClick={() => setSidebarOpen((open) => !open)}
            >
              ☰
            </button>
            <button
              type="button"
              className="sy-icon-btn"
              aria-label="Ayuda"
              onClick={() => setHelpOpen(true)}
            >
              ?
            </button>
            <div className="sy-portal__user" ref={accountMenuRef}>
              <button
                type="button"
                className="sy-user-account-btn"
                aria-expanded={accountMenuOpen}
                aria-label="Abrir menú de usuario"
                onClick={() => setAccountMenuOpen((open) => !open)}
              >
                <div>
                  <strong>{displayName}</strong>
                  <span>{displayRole}</span>
                </div>
                <div className="sy-avatar" aria-hidden />
              </button>
              {accountMenuOpen && (
                <div className="sy-user-menu__dropdown" role="menu">
                  <button type="button" className="sy-user-menu__item" onClick={() => { setAccountMenuOpen(false); navigate('/profile') }}>
                    Perfil
                  </button>
                  <button type="button" className="sy-user-menu__item" onClick={() => { setAccountMenuOpen(false); handleLogout() }}>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="sy-portal__content">{children}</div>
        <footer className="sy-portal__footer">
          <span>© 2026 SaludYa Systems. Todos los derechos reservados.</span>
          <nav>
            <LegalLink slug="privacy">Política de privacidad</LegalLink>
            <LegalLink slug="terms">Términos de servicio</LegalLink>
            <LegalLink slug="support">Soporte</LegalLink>
          </nav>
        </footer>
      </div>
    </div>
  )
}
