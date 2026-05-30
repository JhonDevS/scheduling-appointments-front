import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import seedAppointments from '../mocks/data/appointments.json'
import { parseTime12h } from '../utils/bookingSchedule'
import { toDateKey } from '../utils/colombianHolidays'

const DOCTOR_IDS = ['SY-2024-81', 'SY-2024-82']

function isoToDateAndTime(iso) {
  const d = new Date(iso)
  const hours = d.getHours()
  const minutes = d.getMinutes()
  const period = hours >= 12 ? 'PM' : 'AM'
  let h = hours % 12
  if (h === 0) h = 12
  const time = `${String(h).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`
  return { dateKey: toDateKey(d), time }
}

function seedFromMock() {
  return seedAppointments.flatMap((apt, index) => {
    const doctorId = DOCTOR_IDS[index % DOCTOR_IDS.length]
    const { dateKey, time } = isoToDateAndTime(apt.start)
    return {
      id: `seed-${apt.id}`,
      doctorId,
      dateKey,
      time,
      patientName: apt.clientName,
      patientEmail: apt.clientEmail,
      status: 'confirmed',
      diagnosis: '',
      prescription: '',
      observations: '',
    }
  })
}

export const useAppointmentsBookingStore = create(
  persist(
    (set, get) => ({
      bookings: seedFromMock(),

      getBookingsForDoctorOnDate: (doctorId, dateKey) =>
        get().bookings.filter((b) => b.doctorId === doctorId && b.dateKey === dateKey),

      isSlotBooked: (doctorId, dateKey, time) =>
        get().bookings.some(
          (b) => b.doctorId === doctorId && b.dateKey === dateKey && b.time === time,
        ),

      addBooking: (booking) => {
        const { doctorId, dateKey, time } = booking
        if (get().isSlotBooked(doctorId, dateKey, time)) {
          return { success: false, error: 'Este horario ya está reservado para el profesional seleccionado.' }
        }
        const entry = {
          id: `apt-${Date.now()}`,
          status: 'confirmed',
          diagnosis: '',
          prescription: '',
          observations: '',
          ...booking,
        }
        set((state) => ({ bookings: [...state.bookings, entry] }))
        return { success: true, booking: entry }
      },

      updateBooking: (bookingId, patch) => {
        set((state) => ({
          bookings: state.bookings.map((booking) =>
            booking.id === bookingId ? { ...booking, ...patch } : booking,
          ),
        }))
      },

      removeBooking: (bookingId) => {
        set((state) => ({ bookings: state.bookings.filter((booking) => booking.id !== bookingId) }))
      },
    }),
    { name: 'saludya-bookings' },
  ),
)

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== 'saludya-bookings' || !event.newValue) return
    try {
      const parsed = JSON.parse(event.newValue)
      const nextState = parsed.state ?? parsed
      if (!nextState || !Array.isArray(nextState.bookings)) return
      useAppointmentsBookingStore.setState({ bookings: nextState.bookings })
    } catch (error) {
      console.warn('Error sincronizando citas desde localStorage:', error)
    }
  })
}

export function isSlotInPast(date, timeStr) {
  const minutes = parseTime12h(timeStr)
  if (minutes == null) return true
  const slot = new Date(date)
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  slot.setHours(h, m, 0, 0)
  return slot.getTime() <= Date.now()
}
