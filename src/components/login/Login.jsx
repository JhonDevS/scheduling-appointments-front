import './css/Login.css'

import { useEffect,useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '../../design-system/components/Button'
import { Input } from '../../design-system/components/Input'
import { useAuth } from '../../hooks'
import  Register  from '../register/register'

function Login() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const [view, setView] = useState('login')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true })
    }
  }, [isAuthenticated, navigate])

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

  const validateForgotPassword = () => {
    const newErrors = {}
    if (!formData.email) newErrors.email = 'El correo electrónico es requerido'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    let newErrors = {}

    if (view === 'login') {
      newErrors = validateLogin()

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      const result = await login(formData.email, formData.password)
      if (!result.success) {
        newErrors.password = result.error
        setErrors(newErrors)
      }
    } else if (view === 'forgot-password') {
      newErrors = validateForgotPassword()
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
  }

  const renderLoginForm = () => (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-header">
        <h1 className="app-title">SaludYa</h1>
        <p className="app-subtitle">Bienvenido de nuevo</p>
      </div>

      <Input
        label="Correo electrónico"
        type="email"
        id="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        placeholder="correo@ejemplo.com"
        error={errors.email}
      />

      <Input
        label="Contraseña"
        type="password"
        id="password"
        name="password"
        value={formData.password}
        onChange={handleInputChange}
        placeholder="••••••••"
        error={errors.password}
      />

      <Button type="submit" variant="primary">
        Iniciar sesión
      </Button>

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
          <button type="button" className="link-btn" onClick={() => navigate('/register')}>
          Regístrate
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

      <Input
        label="Correo electrónico"
        type="email"
        id="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        placeholder="correo@ejemplo.com"
        error={errors.email}
      />

      <Button type="submit" variant="primary">
        Enviar enlace de recuperación
      </Button>

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

      <Input
        label="Correo electrónico"
        type="email"
        id="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        placeholder="correo@ejemplo.com"
        error={errors.email}
      />

      <Button type="submit" variant="primary">
        Buscar cuenta
      </Button>

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
        {view === 'register' && <Register onNavigateToLogin={() => setView('login')} />}
        {view === 'forgot-password' && renderForgotPasswordForm()}
        {view === 'recovery' && renderRecoveryForm()}
      </div>
    </div>
  )
}

export default Login