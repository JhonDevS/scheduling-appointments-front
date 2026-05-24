import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import App from '../../src/App'
import { AuthProvider } from '../../src/hooks'

export function renderWithProviders(ui, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>,
  )
}

export function renderApp(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )
}
