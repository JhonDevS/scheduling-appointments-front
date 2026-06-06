import { beforeEach, describe, expect, it } from 'vitest'

import { useUsersAdminStore } from '../../../src/store/usersAdminStore'
import { resetUsersAdminStore } from '../../helpers/store'

describe('usersAdminStore', () => {
  beforeEach(() => {
    resetUsersAdminStore()
  })

  it('agrega usuario', () => {
    const user = useUsersAdminStore.getState().addUser({
      name: 'Nuevo',
      email: 'n@t.com',
      role: 'patient',
      status: 'active',
    })
    expect(user.id).toBeDefined()
    expect(useUsersAdminStore.getState().users.some((u) => u.email === 'n@t.com')).toBe(true)
  })

  it('actualiza y elimina usuario', () => {
    const created = useUsersAdminStore.getState().addUser({
      name: 'Original',
      email: 'original@test.com',
      role: 'patient',
      status: 'active',
    })
    const { updateUser, removeUser } = useUsersAdminStore.getState()
    const id = created.id
    updateUser(id, { name: 'Actualizado' })
    expect(useUsersAdminStore.getState().getUserById(id).name).toBe('Actualizado')
    removeUser(id)
    expect(useUsersAdminStore.getState().getUserById(id)).toBeUndefined()
  })
})
