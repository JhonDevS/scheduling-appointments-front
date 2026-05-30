import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      notifyEmail: true,
      notifySms: false,

      setToken: (token) => set({ token }),
      
      setUser: (user) => set({ user }),
      
      setNotifyEmail: (value) => set({ notifyEmail: value }),
      setNotifySms: (value) => set({ notifySms: value }),

      clearAuth: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
)