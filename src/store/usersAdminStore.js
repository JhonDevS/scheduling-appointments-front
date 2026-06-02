import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import seedUsers from '../mocks/data/users.json'
import { generateUserId } from '../utils/adminUsers'
import { useAuthStore } from './authStore'

const SYSTEM_ADMIN_ID = 'SY-2024-00'
const isAdminRole = (role) => String(role).toLowerCase() === 'admin'
const isAdminUser = (user) => user && isAdminRole(user.role)
const isCurrentAdmin = () => isAdminUser(useAuthStore.getState().user)

export const useUsersAdminStore = create(
  persist(
    (set, get) => ({
      users: [...seedUsers],

      addUser: (user) => {
        const entry = {
          ...user,
          id: user.id || generateUserId(),
          name: user.name || user.nombreCompleto || '',
          nombreCompleto: user.nombreCompleto || user.name || '',
          role: user.role || 'patient',
          status: user.status || 'active',
          specialty: user.specialty || '',
          identification: user.identification || '',
          contractNumber: user.contractNumber || '',
          phone: user.phone || '',
        }
        set((state) => ({ users: [...state.users, entry] }))
        return entry
      },

      updateUser: (id, patch) => {
        set((state) => ({
          users: state.users.map((u) => {
            if (u.id !== id) return u
            const safePatch = { ...patch }
            if (id === SYSTEM_ADMIN_ID) {
              delete safePatch.status
              delete safePatch.role
            }
            return { ...u, ...safePatch }
          }),
        }))
      },

      removeUser: (id) => {
        const user = get().users.find((u) => u.id === id)
        if (!user) return
        const currentUser = useAuthStore.getState().user
        const isSelf = currentUser?.id === id
        if (id === SYSTEM_ADMIN_ID || isSelf) return
        if (isAdminUser(user) && !isCurrentAdmin()) return
        set((state) => ({ users: state.users.filter((u) => u.id !== id) }))
      },

      getUserById: (id) => get().users.find((u) => u.id === id),

      reset: () => set({ users: [...seedUsers, {
        name: 'Administrador SaludYa',
        id: SYSTEM_ADMIN_ID,
        email: 'admin@saludya.com',
        role: 'admin',
        status: 'active',
      }] }),
    }),
    {
      name: 'saludya-admin-users',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

const ensureSystemAdminExists = () => {
  const state = useUsersAdminStore.getState()
  const adminExists = state.users.some((u) => u.id === SYSTEM_ADMIN_ID)
  if (!adminExists) {
    useUsersAdminStore.setState({
      users: [
        ...state.users,
        {
          name: 'Administrador SaludYa',
          id: SYSTEM_ADMIN_ID,
          email: 'admin@saludya.com',
          role: 'admin',
          status: 'active',
        },
      ],
    })
  }
}

ensureSystemAdminExists()

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== 'saludya-admin-users' || !event.newValue) return
    try {
      const parsed = JSON.parse(event.newValue)
      const nextState = parsed.state ?? parsed
      if (!nextState || !Array.isArray(nextState.users)) return
      useUsersAdminStore.setState({ users: nextState.users })
    } catch (error) {
      console.warn('Error sincronizando usuarios desde localStorage:', error)
    }
  })
}
