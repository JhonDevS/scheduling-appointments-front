import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mocks 

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  NavLink: ({ to, children }) => <a href={to}>{children}</a>,
}))
vi.mock('../../../src/components/layout/LegalLink', () => ({ default: ({ children }) => <span>{children}</span> }))
vi.mock('../../../src/components/layout/HelpModal', () => ({ default: ({ isOpen }) => isOpen ? <div role="dialog" /> : null }))
vi.mock('../../../src/components/layout/NotificationsPanel', () => ({ default: () => null }))
vi.mock('../../../src/hooks', () => ({
  useAuth: () => ({ user: { email: 'admin@saludya.com', nombreCompleto: 'Admin', role: 'admin' }, logout: vi.fn() }),
}))

const mockAdd    = vi.fn()
const mockUpdate = vi.fn()
const mockRemove = vi.fn()
const mockStore  = vi.fn()
vi.mock('../../../src/store/usersAdminStore', () => ({
  useUsersAdminStore: (sel) => mockStore(sel),
}))

//  Datos 

const USERS = [
  { id: 'u1', name: 'Ana Gómez',  email: 'ana@saludya.com',   role: 'patient', status: 'active',    identification: '111', contractNumber: '', specialty: '', phone: '300' },
  { id: 'u2', name: 'Dr. García', email: 'doc@saludya.com',   role: 'doctor',  status: 'active',    identification: '',    contractNumber: 'C1', specialty: 'Cardio', phone: '' },
  { id: 'u3', name: 'Luis Pérez', email: 'luis@saludya.com',  role: 'patient', status: 'suspended', identification: '222', contractNumber: '', specialty: '', phone: '' },
]

function setup(users = USERS) {
  mockStore.mockImplementation((sel) => sel({ users, addUser: mockAdd, updateUser: mockUpdate, removeUser: mockRemove }))
}

async function renderPage() {
  const { default: AdminUsers } = await import('../../../src/pages/AdminUsers')
  return render(<AdminUsers />)
}

function openAdd() { fireEvent.click(screen.getByRole('button', { name: /agregar nuevo usuario/i })) }

function fillForm({ name = 'Nuevo', email = 'nuevo@saludya.com', password = 'pass1234', confirm = 'pass1234', role = 'patient', identification = '999', contract = '' } = {}) {
  if (name !== undefined) fireEvent.change(screen.getByLabelText(/^nombre$/i),  { target: { value: name } })
  if (email !== undefined) fireEvent.change(screen.getByLabelText(/^correo$/i),  { target: { value: email } })
  if (role !== 'patient') fireEvent.change(screen.getByLabelText(/^rol$/i), { target: { value: role } })
  if (password !== undefined) fireEvent.change(screen.getByLabelText(/^contraseña$/i), { target: { value: password } })
  if (confirm !== undefined)  fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: confirm } })
  if ((role === 'patient' || role === 'admin') && identification !== undefined)
    fireEvent.change(screen.getByLabelText(/número de identificación/i), { target: { value: identification } })
  if (role === 'doctor' && contract !== undefined)
    fireEvent.change(screen.getByLabelText(/número de contrato/i), { target: { value: contract } })
}

// Tests

describe('AdminUsers', () => {

  beforeEach(() => {
    vi.resetModules()
    mockAdd.mockReset(); mockUpdate.mockReset(); mockRemove.mockReset()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  it('renderiza tabla con usuarios y total correcto', async () => {
    setup()
    await renderPage()
    expect(screen.getByText('Ana Gómez')).toBeInTheDocument()
    expect(screen.getByText('Dr. García')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('muestra badges de rol y estado correctamente', async () => {
    setup()
    await renderPage()
    expect(screen.getAllByText('PACIENTE').length).toBeGreaterThan(0)
    expect(screen.getByText('DOCTOR')).toBeInTheDocument()
    expect(screen.getByText(/suspendido/i)).toBeInTheDocument()
  })

  it('filtra por rol y estado', async () => {
    setup()
    await renderPage()
    fireEvent.click(screen.getByRole('button', { name: /^doctores$/i }))
    await waitFor(() => expect(screen.queryByText('Ana Gómez')).not.toBeInTheDocument())
    expect(screen.getByText('Dr. García')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /todos los roles/i }))
    fireEvent.change(screen.getByRole('combobox', { name: /filtrar por estado/i }), { target: { value: 'suspended' } })
    await waitFor(() => expect(screen.getByText('Luis Pérez')).toBeInTheDocument())
    expect(screen.queryByText('Ana Gómez')).not.toBeInTheDocument()
  })

  it('abre y cierra el modal de nuevo usuario', async () => {
    setup()
    await renderPage()
    openAdd()
    expect(screen.getByRole('heading', { name: /nuevo usuario/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('llama a addUser correctamente con datos válidos', async () => {
    setup()
    await renderPage()
    openAdd()
    fillForm()
    fireEvent.click(screen.getByRole('button', { name: /^guardar$/i }))
    expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({ name: 'Nuevo', email: 'nuevo@saludya.com', role: 'patient' }))
    expect(mockAdd.mock.calls[0][0]).not.toHaveProperty('confirmPassword')
  })

  it('muestra errores de validación al crear usuario', async () => {
    setup()
    await renderPage()
    openAdd()

    // nombre vacío
    fillForm({ name: '' })
    fireEvent.click(screen.getByRole('button', { name: /^guardar$/i }))
    await waitFor(() => expect(screen.getByText(/nombre y correo son obligatorios/i)).toBeInTheDocument())

    // contraseñas no coinciden
    fillForm({ name: 'Test', password: 'abc12345', confirm: 'xyz99999' })
    fireEvent.click(screen.getByRole('button', { name: /^guardar$/i }))
    await waitFor(() => expect(screen.getByText(/las contraseñas deben coincidir/i)).toBeInTheDocument())

    // sin identificación para paciente
    fillForm({ identification: '' })
    fireEvent.click(screen.getByRole('button', { name: /^guardar$/i }))
    await waitFor(() => {
      const errors = screen.queryAllByText(/obligatorio/i)
      expect(errors.length).toBeGreaterThan(0)
    })

    expect(mockAdd).not.toHaveBeenCalled()
  })

  it('precarga datos al editar y llama a updateUser sin password', async () => {
    setup()
    await renderPage()
    fireEvent.click(screen.getByRole('button', { name: /editar ana gómez/i }))
    expect(screen.getByLabelText(/^nombre$/i)).toHaveValue('Ana Gómez')
    fireEvent.change(screen.getByLabelText(/^nombre$/i), { target: { value: 'Ana Editada' } })
    fireEvent.click(screen.getByRole('button', { name: /^guardar$/i }))
    expect(mockUpdate).toHaveBeenCalledWith('u1', expect.objectContaining({ name: 'Ana Editada' }))
    expect(mockUpdate.mock.calls[0][1]).not.toHaveProperty('password')
  })

  it('elimina usuario al confirmar y no elimina si cancela', async () => {
    setup()
    await renderPage()
    fireEvent.click(screen.getByRole('button', { name: /eliminar ana gómez/i }))
    expect(mockRemove).toHaveBeenCalledWith('u1')

    mockRemove.mockReset()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    fireEvent.click(screen.getByRole('button', { name: /eliminar dr\. garcía/i }))
    expect(mockRemove).not.toHaveBeenCalled()
  })

  it('muestra paginación con más de 10 usuarios', async () => {
    const many = Array.from({ length: 12 }, (_, i) => ({
      id: `u${i}`, name: `User ${i}`, email: `u${i}@saludya.com`,
      role: 'patient', status: 'active', identification: `${i}`,
      contractNumber: '', specialty: '', phone: '',
    }))
    setup(many)
    await renderPage()
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '›' })).not.toBeDisabled()
  })
})