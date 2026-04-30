import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '../../design-system/components/Button'
import { Input } from '../../design-system/components/Input'
import { useAuth } from '../../hooks'  

function Register() {
  const navigate = useNavigate()  
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    lastName: '',
    phone: ''
  })
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
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
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateRegister()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)

    const result = await register({
      ...formData,
      nombreCompleto: `${formData.name} ${formData.lastName}`.trim()
    })
    if (result.success) {
      setSuccessMessage('Usuario registrado exitosamente. Por favor, inicia sesión.')
      setTimeout(() => navigate('/login'), 2000)
    } else {
      setIsLoading(false)
      const errorMsg = result.error
      if (typeof errorMsg === 'object' && errorMsg !== null) {
        const fieldErrors = {}
        for (const [key, value] of Object.entries(errorMsg)) {
          if (key === 'nombreCompleto') fieldErrors.name = value
          else if (key === 'correo') fieldErrors.email = value
          else if (key === 'telefono') fieldErrors.phone = value
          else if (key === 'password') fieldErrors.password = value
          else fieldErrors.general = Array.isArray(value) ? value[0] : value
        }
        setErrors(fieldErrors)
      } else {
        setErrors({ general: errorMsg })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-header">
        <h1 className="app-title">Crear cuenta</h1>
        <p className="app-subtitle">Únete a SaludYa</p>
      </div>

      <div className="form-row">
        <Input
          label="Nombre"
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Juan"
          error={errors.name}
        />

        <Input
          label="Apellido"
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          placeholder="Pérez"
          error={errors.lastName}
        />
      </div>

      <Input
        label="Teléfono"
        type="tel"
        id="phone"
        name="phone"
        value={formData.phone}
        onChange={handleInputChange}
        placeholder="+51 999 999 999"
        error={errors.phone}
      />

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

      <Input
        label="Confirmar contraseña"
        type="password"
        id="confirmPassword"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleInputChange}
        placeholder="••••••••"
        error={errors.confirmPassword}
      />

      {errors.general && (
        <div className="error-banner">{errors.general}</div>
      )}

      {successMessage && (
        <div className="success-banner">{successMessage}</div>
      )}

      <Button type="submit" variant="primary" disabled={isLoading}>
        {isLoading ? 'Registrando...' : 'Crear cuenta'}
      </Button>

      <p className="register-prompt">
        ¿Ya tienes una cuenta?{' '}
        <button type="button" className="link-btn" onClick={() => navigate('/login')}>
            Inicia sesión
        </button>
      </p>
    </form>
  )
}

export default Register