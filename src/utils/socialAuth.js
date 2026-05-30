const GMAIL_DOMAINS = ['gmail.com', 'googlemail.com']
const MICROSOFT_DOMAINS = [
  'outlook.com',
  'outlook.es',
  'hotmail.com',
  'hotmail.es',
  'live.com',
  'msn.com',
]

export function getEmailDomain(email) {
  const parts = email.trim().toLowerCase().split('@')
  return parts.length === 2 ? parts[1] : ''
}

export function isGmailAddress(email) {
  return GMAIL_DOMAINS.includes(getEmailDomain(email))
}

export function isMicrosoftPersonalEmail(email) {
  return MICROSOFT_DOMAINS.includes(getEmailDomain(email))
}

export function validateProviderEmail(provider, email) {
  if (!email?.includes('@')) {
    return { valid: false, error: 'Ingrese un correo válido.' }
  }
  if (provider === 'google' && !isGmailAddress(email)) {
    return { valid: false, error: 'Use una cuenta de Gmail (@gmail.com).' }
  }
  if (provider === 'microsoft' && !isMicrosoftPersonalEmail(email)) {
    return {
      valid: false,
      error: 'Use Outlook, Hotmail o Live (@outlook.com, @hotmail.com, etc.).',
    }
  }
  return { valid: true }
}

export const hasGoogleClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)
export const hasMicrosoftClientId = Boolean(import.meta.env.VITE_MICROSOFT_CLIENT_ID)
