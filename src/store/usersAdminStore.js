import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { generateUserId } from '../utils/adminUsers'

export const useUsersAdminStore = create(
  persist(
    (set, get) => ({
      // Inicialmente vacío; se pobla desde el backend admin-users
      users: [],

       setUsers: (list) => {
         const normalized = Array.isArray(list)
           ? list.map((user) => ({
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
             }))
           : []
         set({ users: normalized })
       },

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
          users: state.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
        }))
      },

      removeUser: (id) => {
        set((state) => ({ users: state.users.filter((u) => u.id !== id) }))
      },

      getUserById: (id) => get().users.find((u) => u.id === id),

      reset: () => set({ users: [] }),
    }),
    {
      name: 'saludya-admin-users',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

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
