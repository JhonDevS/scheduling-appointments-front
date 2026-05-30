import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderApp } from '../helpers/test-utils'

describe('Integración — páginas legales', () => {
  it('muestra política de privacidad', async () => {
    renderApp('/legal/privacy')
    expect(await screen.findByRole('heading', { name: /política de privacidad/i })).toBeInTheDocument()
  })

  it('muestra 404 para slug inválido', async () => {
    renderApp('/legal/desconocido')
    expect(await screen.findByRole('heading', { name: /página no encontrada/i })).toBeInTheDocument()
  })
})
