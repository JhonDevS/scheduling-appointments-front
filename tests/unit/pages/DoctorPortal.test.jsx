import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

import DoctorPortal from '../../../src/pages/DoctorPortal'
import { AuthProvider } from '../../../src/hooks'
import { resetUsersAdminStore, seedAuthenticatedUser } from '../../helpers/store'

//  Mock de DoctorLayout 
vi.mock('../../../src/components/layout/DoctorLayout', () => ({
  default: ({ children, searchQuery, onSearchChange }) => (
    <div data-testid="doctor-layout">
      <input
        data-testid="search-input"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar..."
      />
      <div data-testid="layout-children">{children}</div>
    </div>
  ),
}))


function FakeChild() {
  const { useOutletContext } = require('react-router-dom')
  const { searchQuery } = useOutletContext()
  return <div data-testid="outlet-child">query: {searchQuery}</div>
}

//  Helper
const renderDoctorPortal = () =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/doctor']}>
        <Routes>
          <Route path="/doctor" element={<DoctorPortal />}>
            <Route index element={<FakeChild />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )

// Tests 

describe('DoctorPortal', () => {
  beforeEach(() => {
    resetUsersAdminStore()
    seedAuthenticatedUser()
  })

  // 1. Renderizado inicial
  describe('Renderizado inicial', () => {
    it('renderiza el DoctorLayout', () => {
      renderDoctorPortal()
      expect(screen.getByTestId('doctor-layout')).toBeInTheDocument()
    })

    it('renderiza el Outlet (hijo de la ruta)', () => {
      renderDoctorPortal()
      expect(screen.getByTestId('outlet-child')).toBeInTheDocument()
    })

    it('inicia con searchQuery vacío', () => {
      renderDoctorPortal()
      expect(screen.getByTestId('search-input')).toHaveValue('')
    })

    it('pasa searchQuery vacío al Outlet en el estado inicial', () => {
      renderDoctorPortal()
      expect(screen.getByTestId('outlet-child')).toHaveTextContent('query:')
    })
  })

  // 2. Búsqueda
  describe('searchQuery', () => {
    it('actualiza searchQuery al escribir en el input', () => {
      renderDoctorPortal()
      fireEvent.change(screen.getByTestId('search-input'), {
        target: { value: 'Juan' },
      })
      expect(screen.getByTestId('search-input')).toHaveValue('Juan')
    })

    it('pasa el searchQuery actualizado al Outlet', () => {
      renderDoctorPortal()
      fireEvent.change(screen.getByTestId('search-input'), {
        target: { value: 'cardio' },
      })
      expect(screen.getByTestId('outlet-child')).toHaveTextContent('query: cardio')
    })

    it('actualiza searchQuery al borrar el texto', () => {
      renderDoctorPortal()
      const input = screen.getByTestId('search-input')
      fireEvent.change(input, { target: { value: 'texto' } })
      fireEvent.change(input, { target: { value: '' } })
      expect(input).toHaveValue('')
    })

    it('pasa searchQuery vacío al Outlet tras borrar el texto', () => {
      renderDoctorPortal()
      const input = screen.getByTestId('search-input')
      fireEvent.change(input, { target: { value: 'algo' } })
      fireEvent.change(input, { target: { value: '' } })
      expect(screen.getByTestId('outlet-child')).toHaveTextContent('query:')
    })

    it('permite múltiples cambios consecutivos en el searchQuery', () => {
      renderDoctorPortal()
      const input = screen.getByTestId('search-input')
      fireEvent.change(input, { target: { value: 'a' } })
      fireEvent.change(input, { target: { value: 'ab' } })
      fireEvent.change(input, { target: { value: 'abc' } })
      expect(input).toHaveValue('abc')
      expect(screen.getByTestId('outlet-child')).toHaveTextContent('query: abc')
    })
  })
})