import { beforeEach, describe, expect, it } from 'vitest'

import { useNewsletterStore } from '../../../src/store/newsletterStore'
import { resetNewsletterStore } from '../../helpers/store'

describe('newsletterStore', () => {
  beforeEach(() => {
    resetNewsletterStore()
  })

  it('suscribe correo válido', () => {
    const result = useNewsletterStore.getState().subscribe('test@saludya.com')
    expect(result.success).toBe(true)
  })

  it('rechaza correo inválido', () => {
    const result = useNewsletterStore.getState().subscribe('mal')
    expect(result.success).toBe(false)
  })

  it('rechaza duplicado', () => {
    useNewsletterStore.getState().subscribe('dup@saludya.com')
    const result = useNewsletterStore.getState().subscribe('dup@saludya.com')
    expect(result.success).toBe(false)
  })
})
