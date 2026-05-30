import { describe, expect, it } from 'vitest'

import { validateNewsletterEmail } from '../../../src/utils/newsletter'

describe('validateNewsletterEmail', () => {
  it('rechaza correo vacío', () => {
    expect(validateNewsletterEmail('').valid).toBe(false)
  })

  it('rechaza formato inválido', () => {
    expect(validateNewsletterEmail('no-email').valid).toBe(false)
  })

  it('acepta correo válido', () => {
    const result = validateNewsletterEmail('  user@saludya.com ')
    expect(result.valid).toBe(true)
    expect(result.email).toBe('user@saludya.com')
  })
})
