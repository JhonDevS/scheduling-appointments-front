import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import NotificationsPanel from '../../../src/components/layout/NotificationsPanel'

describe('NotificationsPanel', () => {
  it('no renderiza cerrado', () => {
    const { container } = render(<NotificationsPanel isOpen={false} onClose={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('muestra notificaciones y cierra', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <NotificationsPanel
        isOpen
        onClose={onClose}
        notifications={[{ id: '1', text: 'Test', unread: true }]}
      />,
    )
    expect(screen.getByText('Test')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /cerrar/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
