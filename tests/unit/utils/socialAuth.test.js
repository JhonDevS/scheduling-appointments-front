import { describe, expect, it } from 'vitest'

import {
  getEmailDomain,
  isGmailAddress,
  isMicrosoftPersonalEmail,
  validateProviderEmail,
} from '../../../src/utils/socialAuth'

describe('socialAuth', () => {
  it('extrae el dominio del correo', () => {
    expect(getEmailDomain('Usuario@Gmail.COM')).toBe('gmail.com')
  })

  it('valida correos de Gmail', () => {
    expect(isGmailAddress('a@gmail.com')).toBe(true)
    expect(isGmailAddress('a@outlook.com')).toBe(false)
  })

  it('valida correos de Microsoft', () => {
    expect(isMicrosoftPersonalEmail('a@hotmail.com')).toBe(true)
    expect(isMicrosoftPersonalEmail('a@outlook.es')).toBe(true)
    expect(isMicrosoftPersonalEmail('a@gmail.com')).toBe(false)
  })

  it('rechaza dominios incorrectos por proveedor', () => {
    expect(validateProviderEmail('google', 'a@hotmail.com').valid).toBe(false)
    expect(validateProviderEmail('microsoft', 'a@gmail.com').valid).toBe(false)
    expect(validateProviderEmail('google', 'a@gmail.com').valid).toBe(true)
  })
})
