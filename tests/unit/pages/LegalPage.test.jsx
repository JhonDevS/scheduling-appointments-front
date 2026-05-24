import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import LegalPage from '../../../src/pages/LegalPage'

describe('LegalPage', () => {
  it('renderiza contenido legal', () => {
    render(
      <MemoryRouter initialEntries={['/legal/terms']}>
        <Routes>
          <Route path="/legal/:slug" element={<LegalPage />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /términos de servicio/i })).toBeInTheDocument()
  })
})
