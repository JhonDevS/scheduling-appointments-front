const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateNewsletterEmail(email) {
  const trimmed = email.trim()
  if (!trimmed) return { valid: false, error: 'Ingrese su correo electrónico.' }
  if (!EMAIL_RE.test(trimmed)) return { valid: false, error: 'Correo electrónico no válido.' }
  return { valid: true, email: trimmed }
}
