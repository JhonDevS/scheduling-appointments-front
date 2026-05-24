import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { validateNewsletterEmail } from '../utils/newsletter'

export const useNewsletterStore = create(
  persist(
    (set, get) => ({
      subscribers: [],

      subscribe: (email) => {
        const check = validateNewsletterEmail(email)
        if (!check.valid) return { success: false, error: check.error }
        if (get().subscribers.includes(check.email)) {
          return { success: false, error: 'Este correo ya está registrado.' }
        }
        set((state) => ({ subscribers: [...state.subscribers, check.email] }))
        return { success: true, email: check.email }
      },
    }),
    { name: 'saludya-newsletter' },
  ),
)
