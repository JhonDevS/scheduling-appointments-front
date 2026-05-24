import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const usePrescriptionRenewalsStore = create(
  persist(
    (set, get) => ({
      renewals: [],

      requestRenewal: (medicationName) => {
        const name = medicationName?.trim()
        if (!name) return { success: false, error: 'Medicamento no válido.' }
        if (get().renewals.some((r) => r.name === name && r.status === 'pending')) {
          return { success: false, error: 'Ya existe una solicitud pendiente para este medicamento.' }
        }
        const entry = { id: `rx-${Date.now()}`, name, status: 'pending', requestedAt: new Date().toISOString() }
        set((state) => ({ renewals: [...state.renewals, entry] }))
        return { success: true, renewal: entry }
      },

      isPending: (name) => get().renewals.some((r) => r.name === name && r.status === 'pending'),
    }),
    { name: 'saludya-prescription-renewals' },
  ),
)
