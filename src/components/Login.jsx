import './Login.css'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { MOCK_PASSWORD,MOCK_USER } from '../App'

function Login() {
  const navigate = useNavigate()
  const [view, setView] = useState('login')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    lastName: '',
    phone: '',
    role: ''
  })
  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const validateLogin = () => {
    const newErrors = {}
    if (!formData.email) newErrors.email = 'El correo electrónico es requerido'
    if (!formData.password) newErrors.password = 'La contraseña es requerida'
    return newErrors
  }

  const validateRegister = () => {
    const newErrors = {}
    if (!formData.name) newErrors.name = 'El nombre es requerido'
    if (!formData.lastName) newErrors.lastName = 'El apellido es requerido'
    if (!formData.email) newErrors.email = 'El correo electrónico es requerido'
    if (!formData.phone) newErrors.phone = 'El teléfono es requerido'
    if (!formData.password) newErrors.password = 'La contraseña es requerida'
    if (formData.password.length < 6) newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Debes confirmar tu contraseña'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden'
    if (!formData.role) newErrors.role = 'Debes seleccionar un rol'
    return newErrors
  }

  const validateForgotPassword = () => {
    const newErrors = {}
    if (!formData.email) newErrors.email = 'El correo electrónico es requerido'
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    let newErrors = {}

    if (view === 'login') {
      newErrors = validateLogin()
      
      // Validar con mock
      if (formData.email === MOCK_USER && formData.password === MOCK_PASSWORD) {
        localStorage.setItem('isAuthenticated', 'true')
        navigate('/home')
        return
      } else if (formData.email && formData.password) {
        newErrors.password = 'Credenciales inválidas'
        setErrors(newErrors)
        return
      }
    } else if (view === 'register') {
      newErrors = validateRegister()
    } else if (view === 'forgot-password') {
      newErrors = validateForgotPassword()
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Aquí iría la lógica de autenticación con Firebase o backend
    console.log('Form submitted:', { view, ...formData })
  }

  const renderLoginForm = () => (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-header">
        <h1 className="app-title">SaludYa</h1>
        <p className="app-subtitle">Bienvenido de nuevo</p>
      </div>

      <div className="form-group">
        <label htmlFor="email">Correo electrónico</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="correo@ejemplo.com"
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="password">Contraseña</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="••••••••"
          className={errors.password ? 'error' : ''}
        />
        {errors.password && <span className="error-message">{errors.password}</span>}
      </div>

      <button type="submit" className="btn-primary">Iniciar sesión</button>

      <div className="form-links">
        <button type="button" className="link-btn" onClick={() => setView('forgot-password')}>
          ¿Olvidaste tu contraseña?
        </button>
        <button type="button" className="link-btn" onClick={() => setView('recovery')}>
          Recuperar cuenta
        </button>
      </div>

      <div className="divider">
        <span>o</span>
      </div>

      <p className="register-prompt">
        ¿No tienes una cuenta?{' '}
        <button type="button" className="link-btn" onClick={() => setView('register')}>
          Regístrate
        </button>
      </p>
    </form>
  )

  const renderRegisterForm = () => (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-header">
        <h1 className="app-title">Crear cuenta</h1>
        <p className="app-subtitle">Únete a SaludYa</p>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">Nombre</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Juan"
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Apellido</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Pérez"
            className={errors.lastName ? 'error' : ''}
          />
          {errors.lastName && <span className="error-message">{errors.lastName}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="phone">Teléfono</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="+51 999 999 999"
          className={errors.phone ? 'error' : ''}
        />
        {errors.phone && <span className="error-message">{errors.phone}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="email">Correo electrónico</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="correo@ejemplo.com"
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="role">Selecciona tu rol</label>
        <div className="role-selector">
          <button
            type="button"
            className={`role-option ${formData.role === 'administrator' ? 'selected' : ''}`}
            onClick={() => setFormData({ ...formData, role: 'administrator' })}
          >
            <span className="role-icon">👨‍💼</span>
            <span className="role-label">Administrador</span>
          </button>
          <button
            type="button"
            className={`role-option ${formData.role === 'medical' ? 'selected' : ''}`}
            onClick={() => setFormData({ ...formData, role: 'medical' })}
          >
            <span className="role-icon">👨‍⚕️</span>
            <span className="role-label">Médico</span>
          </button>
          <button
            type="button"
            className={`role-option ${formData.role === 'patient' ? 'selected' : ''}`}
            onClick={() => setFormData({ ...formData, role: 'patient' })}
          >
            <span className="role-icon">🧑‍🤝‍🧑</span>
            <span className="role-label">Paciente</span>
          </button>
        </div>
        {errors.role && <span className="error-message">{errors.role}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="password">Contraseña</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="••••••••"
          className={errors.password ? 'error' : ''}
        />
        {errors.password && <span className="error-message">{errors.password}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirmar contraseña</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="••••••••"
          className={errors.confirmPassword ? 'error' : ''}
        />
        {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
      </div>

      <button type="submit" className="btn-primary">Crear cuenta</button>

      <p className="register-prompt">
        ¿Ya tienes una cuenta?{' '}
        <button type="button" className="link-btn" onClick={() => setView('login')}>
          Inicia sesión
        </button>
      </p>
    </form>
  )

  const renderForgotPasswordForm = () => (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-header">
        <h1 className="app-title">¿Olvidaste tu contraseña?</h1>
        <p className="app-subtitle">Ingresa tu correo para recuperar el acceso</p>
      </div>

      <div className="form-group">
        <label htmlFor="email">Correo electrónico</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="correo@ejemplo.com"
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>

      <button type="submit" className="btn-primary">Enviar enlace de recuperación</button>

      <p className="register-prompt">
        ¿Recordaste tu contraseña?{' '}
        <button type="button" className="link-btn" onClick={() => setView('login')}>
          Inicia sesión
        </button>
      </p>
    </form>
  )

  const renderRecoveryForm = () => (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-header">
        <h1 className="app-title">Recuperar cuenta</h1>
        <p className="app-subtitle">Ingresa tu correo para recuperar tu cuenta</p>
      </div>

      <div className="form-group">
        <label htmlFor="email">Correo electrónico</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="correo@ejemplo.com"
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>

      <button type="submit" className="btn-primary">Buscar cuenta</button>

      <p className="register-prompt">
        ¿Ya tienes acceso?{' '}
        <button type="button" className="link-btn" onClick={() => setView('login')}>
          Inicia sesión
        </button>
      </p>
    </form>
  )

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>
      <div className="login-card">
        {view === 'login' && renderLoginForm()}
        {view === 'register' && renderRegisterForm()}
        {view === 'forgot-password' && renderForgotPasswordForm()}
        {view === 'recovery' && renderRecoveryForm()}
      </div>
    </div>
  )
}

export default Login