import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Button } from '../../../src/design-system/components/Button'

describe('Button', () => {
  it('renderiza el texto y variantes', () => {
    render(
      <Button variant="primary" size="lg">
        Agendar cita
      </Button>,
    )

    const button = screen.getByRole('button', { name: /agendar cita/i })
    expect(button).toHaveClass('btn-primary', 'btn-lg')
  })

  it('respeta disabled', () => {
    render(<Button disabled>No disponible</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
