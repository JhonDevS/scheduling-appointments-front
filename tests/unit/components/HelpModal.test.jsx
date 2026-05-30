import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import HelpModal from '../../../src/components/layout/HelpModal'

describe('HelpModal', () => {
  it('no renderiza cuando está cerrado', () => {
    const { container } = render(<HelpModal isOpen={false} onClose={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('cierra al pulsar entendido', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<HelpModal isOpen onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: /entendido/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
