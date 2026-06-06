import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import DoctorAnalytics from '../../../src/pages/DoctorAnalytics'
import { AuthProvider } from '../../../src/hooks'
import mockUsers from '../../../src/mocks/data/users.json'
import { useUsersAdminStore } from '../../../src/store/usersAdminStore'
import { resetBookingsStore, resetUsersAdminStore, seedAuthenticatedUser } from '../../helpers/store'
import { getMonthStartKey } from '../../../src/utils/colombianHolidays'

function getStatValue(container, label) {
  const stat = Array.from(container.querySelectorAll('.sy-stat-mini')).find((el) =>
    el.textContent.includes(label),
  )

  return stat?.querySelector('strong')?.textContent
}

describe('DoctorAnalytics', () => {
  beforeEach(() => {
    resetUsersAdminStore()
    useUsersAdminStore.getState().setUsers(mockUsers)
    resetBookingsStore([])
    seedAuthenticatedUser({
      id: 1,
      email: 'a.sterling@saludya.com',
      nombreCompleto: 'Dr. Alexander Sterling',
    })
  })

  it('muestra las métricas del mes actual solo para el doctor autenticado', async () => {
    const monthStartKey = getMonthStartKey(new Date())
    const dateInMonth = `${monthStartKey.slice(0, 8)}15`
    const [year, month] = monthStartKey.split('-').map(Number)
    const previousMonth = month === 1 ? `${year - 1}-12-15` : `${year}-${String(month - 1).padStart(2, '0')}-15`

    resetBookingsStore([
      {
        id: 'apt-1',
        doctorId: 'SY-2024-81',
        dateKey: dateInMonth,
        time: '09:00 AM',
        patientEmail: 'paciente1@test.com',
        patientName: 'Paciente Uno',
        status: 'atendida',
      },
      {
        id: 'apt-2',
        doctorId: 'SY-2024-81',
        dateKey: dateInMonth,
        time: '10:00 AM',
        patientEmail: 'paciente2@test.com',
        patientName: 'Paciente Dos',
        status: 'completed',
      },
      {
        id: 'apt-3',
        doctorId: 'SY-2024-81',
        dateKey: dateInMonth,
        time: '11:00 AM',
        patientEmail: 'paciente1@test.com',
        patientName: 'Paciente Uno',
        status: 'cancelled',
      },
      {
        id: 'apt-4',
        doctorId: 'SY-2024-82',
        dateKey: dateInMonth,
        time: '09:00 AM',
        patientEmail: 'otro@test.com',
        patientName: 'Otro Doctor',
        status: 'atendida',
      },
      {
        id: 'apt-5',
        doctorId: 'SY-2024-81',
        dateKey: previousMonth,
        time: '09:00 AM',
        patientEmail: 'pasado@test.com',
        patientName: 'Mes Anterior',
        status: 'atendida',
      },
    ])

    const { container } = render(
      <AuthProvider>
        <MemoryRouter>
          <DoctorAnalytics />
        </MemoryRouter>
      </AuthProvider>,
    )

    expect(screen.getByRole('heading', { name: /Analíticas/i })).toBeInTheDocument()
    expect(
      await screen.findByText(/Resumen de actividad clínica para Dr\. Alexander Sterling durante el mes actual/i),
    ).toBeInTheDocument()
    expect(getStatValue(container, 'Citas completadas este mes')).toBe('2')
    expect(getStatValue(container, 'Tasa de asistencia')).toBe('100%')
    expect(getStatValue(container, 'Pacientes distintos')).toBe('2')
    expect(getStatValue(container, 'Cancelaciones')).toBe('1')
  })
})
