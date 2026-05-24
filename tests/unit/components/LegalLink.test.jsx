import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import LegalLink from '../../../src/components/layout/LegalLink'

describe('LegalLink', () => {
  it('enlaza a página legal', () => {
    render(
      <MemoryRouter>
        <LegalLink slug="terms">Términos</LegalLink>
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Términos' })).toHaveAttribute('href', '/legal/terms')
  })
})
