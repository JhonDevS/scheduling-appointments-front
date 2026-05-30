import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export function validateAvailabilitySlot({ date, startTime, endTime }) {
  if (!date) return { valid: false, error: 'Seleccione una fecha.' }
  if (!startTime || !endTime) return { valid: false, error: 'Indique hora de inicio y fin.' }
  if (startTime >= endTime) return { valid: false, error: 'La hora de fin debe ser posterior al inicio.' }
  return { valid: true }
}

export const useDoctorAvailabilityStore = create(
  persist(
    (set, get) => ({
      slots: [],

      addSlot: (slot) => {
        const check = validateAvailabilitySlot(slot)
        if (!check.valid) return { success: false, error: check.error }
        const entry = { id: `slot-${Date.now()}`, ...slot }
        set((state) => ({ slots: [...state.slots, entry] }))
        return { success: true, slot: entry }
      },

      getSlotsForDate: (date) => get().slots.filter((s) => s.date === date),
    }),
    { name: 'saludya-doctor-availability' },
  ),
)
