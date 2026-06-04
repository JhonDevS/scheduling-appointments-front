import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import Landing from '../../../src/pages/Landing'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../../../src/components/layout/PublicNavbar', () => ({
  default: () => <div>PublicNavbar</div>,
}))

vi.mock('../../../src/components/layout/AppFooter', () => ({
  default: () => <div>AppFooter</div>,
}))

vi.mock('../../../src/components/how-it-works/HowItWorksModal', () => ({
  default: ({ isOpen }) =>
    isOpen ? <div role="dialog">How It Works Modal</div> : null,
}))

const subscribeMock = vi.fn()

vi.mock('../../../src/store/newsletterStore', () => ({
  useNewsletterStore: (selector) =>
    selector({
      subscribe: subscribeMock,
    }),
}))

describe('Landing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza correctamente el contenido principal', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {
        name: /Experimente una gestión de salud/i,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: /Agendar su cita/i,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: /Cómo funciona/i,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', {
        name: /Así funciona SaludYa/i,
      }),
    ).toBeInTheDocument()
  })

  it('navega a /book al hacer clic en Agendar su cita', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    )

    await user.click(
      screen.getByRole('button', {
        name: /Agendar su cita/i,
      }),
    )

    expect(mockNavigate).toHaveBeenCalledWith('/book')
  })

  it('abre el modal de Cómo funciona', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    )

    await user.click(
      screen.getByRole('button', {
        name: /Cómo funciona/i,
      }),
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('permite suscribirse al newsletter exitosamente', async () => {
    const user = userEvent.setup()

    subscribeMock.mockReturnValue({
      success: true,
    })

    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    )

    await user.type(
      screen.getByRole('textbox', {
        name: /Correo médico/i,
      }),
      'usuario@test.com',
    )

    await user.click(
      screen.getByRole('button', {
        name: /Comenzar/i,
      }),
    )

    expect(subscribeMock).toHaveBeenCalledWith(
      'usuario@test.com',
    )

    expect(
      screen.getByRole('status'),
    ).toHaveTextContent(
      '¡Gracias! Le contactaremos pronto.',
    )
  })

  it('muestra mensaje de error cuando la suscripción falla', async () => {
    const user = userEvent.setup()

    subscribeMock.mockReturnValue({
      success: false,
      error: 'Correo inválido',
    })

    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    )

    await user.type(
      screen.getByRole('textbox', {
        name: /Correo médico/i,
      }),
      'usuario@test.com',
    )

    await user.click(
      screen.getByRole('button', {
        name: /Comenzar/i,
      }),
    )

    expect(
      screen.getByRole('status'),
    ).toHaveTextContent('Correo inválido')
  })
})