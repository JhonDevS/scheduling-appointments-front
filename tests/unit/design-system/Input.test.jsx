import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Input } from '../../../src/design-system/components/Input'

describe('Input', () => {
  it('muestra etiqueta y mensaje de error', () => {
    render(
      <Input
        label="Correo electrónico"
        name="email"
        error="El correo es obligatorio"
        placeholder="correo@ejemplo.com"
      />,
    )

    expect(screen.getByText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByText(/el correo es obligatorio/i)).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveClass('input-error')
  })
})
