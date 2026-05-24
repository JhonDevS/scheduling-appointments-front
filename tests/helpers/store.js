import { useAppointmentsBookingStore } from '../../src/store/appointmentsBookingStore'
import { useAuthStore } from '../../src/store/authStore'
import { useDoctorAvailabilityStore } from '../../src/store/doctorAvailabilityStore'
import { useNewsletterStore } from '../../src/store/newsletterStore'
import { usePrescriptionRenewalsStore } from '../../src/store/prescriptionRenewalsStore'
import { useUsersAdminStore } from '../../src/store/usersAdminStore'
import { toDateKey } from '../../src/utils/colombianHolidays'
import { isDateBookable } from '../../src/utils/bookingSchedule'

export function resetAuthStore() {
  useAuthStore.getState().clearAuth()
}

export function getFirstBookableDate() {
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  for (let i = 0; i < 60; i += 1) {
    if (isDateBookable(cursor)) return new Date(cursor)
    cursor.setDate(cursor.getDate() + 1)
  }
  return new Date()
}

export function getFirstBookableDateKey() {
  return toDateKey(getFirstBookableDate())
}

export function seedAuthenticatedUser(
  user = { id: 1, email: 'paciente@saludya.com', nombreCompleto: 'Paciente Prueba' },
) {
  useAuthStore.getState().setToken('test-token-vitest')
  useAuthStore.getState().setUser(user)
}

export function resetBookingsStore(bookings = []) {
  useAppointmentsBookingStore.persist.clearStorage()
  useAppointmentsBookingStore.setState({ bookings })
}

export function seedBooking({ doctorId, dateKey, time, patientName = 'Otro Paciente' }) {
  useAppointmentsBookingStore.getState().addBooking({
    doctorId,
    dateKey,
    time,
    patientName,
    patientEmail: 'otro@saludya.com',
  })
}

export function resetUsersAdminStore() {
  useUsersAdminStore.persist.clearStorage()
  useUsersAdminStore.getState().reset()
}

export function resetNewsletterStore() {
  useNewsletterStore.persist.clearStorage()
  useNewsletterStore.setState({ subscribers: [] })
}

export function resetDoctorAvailabilityStore() {
  useDoctorAvailabilityStore.persist.clearStorage()
  useDoctorAvailabilityStore.setState({ slots: [] })
}

export function resetPrescriptionRenewalsStore() {
  usePrescriptionRenewalsStore.persist.clearStorage()
  usePrescriptionRenewalsStore.setState({ renewals: [] })
}
