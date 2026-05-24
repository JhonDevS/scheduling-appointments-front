import { describe, expect, it } from 'vitest'

import { getLegalPage, LEGAL_SLUGS } from '../../../src/utils/legalContent'

describe('legalContent', () => {
  it('expone todos los slugs legales', () => {
    expect(LEGAL_SLUGS).toContain('privacy')
    expect(LEGAL_SLUGS).toContain('terms')
  })

  it('devuelve página por slug válido', () => {
    const page = getLegalPage('privacy')
    expect(page.title).toMatch(/privacidad/i)
    expect(page.sections.length).toBeGreaterThan(0)
  })

  it('devuelve null para slug desconocido', () => {
    expect(getLegalPage('invalid')).toBeNull()
  })
})
