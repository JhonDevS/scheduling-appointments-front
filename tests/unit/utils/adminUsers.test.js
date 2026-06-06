import { describe, expect, it } from 'vitest'

import { ADMIN_PAGE_SIZE, filterUsers, generateUserId, paginateUsers } from '../../../src/utils/adminUsers'

const USERS = [
  { id: '1', role: 'doctor', status: 'active' },
  { id: '2', role: 'patient', status: 'active' },
  { id: '3', role: 'admin', status: 'suspended' },
]

describe('adminUsers utils', () => {
  it('filtra por rol', () => {
    const doctors = filterUsers(USERS, { roleFilter: 'doctor' })
    expect(doctors).toHaveLength(1)
  })

  it('filtra por estado', () => {
    const suspended = filterUsers(USERS, { statusFilter: 'suspended' })
    expect(suspended).toHaveLength(1)
  })

  it('combina filtros de rol y estado', () => {
    const result = filterUsers(
      [
        { id: '1', role: 'doctor', status: 'active' },
        { id: '2', role: 'doctor', status: 'suspended' },
      ],
      { roleFilter: 'doctor', statusFilter: 'active' },
    )
    expect(result).toHaveLength(1)
  })

  it('pagina resultados', () => {
    const users = Array.from({ length: 13 }, (_, index) => ({
      id: String(index + 1),
      role: 'patient',
      status: 'active',
    }))

    const page = paginateUsers(users, 1, ADMIN_PAGE_SIZE)
    expect(page.items).toHaveLength(ADMIN_PAGE_SIZE)
    expect(page.totalPages).toBe(2)
  })

  it('genera id de usuario', () => {
    expect(generateUserId()).toMatch(/^SY-\d{4}-/)
  })
})
