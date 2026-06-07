import api from './api'
import { endpoints } from './endpoints'

export const appointmentsService = {

  async getAllAppointments() {
    const response = await api.get(endpoints.appointments.getAll)
    // backend devuelve { success, message, data }; interceptor deja data
    if (Array.isArray(response.data)) return response.data
    if (Array.isArray(response)) return response
    return []
  },

  async getAppointmentsByDateRange(start, end) {
    const url = endpoints.appointments.getByDateRange(start, end)
    const response = await api.get(url)
    if (Array.isArray(response.data)) return response.data
    if (Array.isArray(response)) return response
    return []
  },

  async getAppointmentById(id) {
    const url = endpoints.appointments.getById(id)
    const response = await api.get(url)
    return response.data ?? response
  },

  async createAppointment(appointmentData) {
    const {
      doctorId,
      dateKey,
      time,
      durationMinutes = 30,
      notes,
    } = appointmentData

    const [timePart, period] = String(time).split(' ')
    const [hhStr, mmStr] = timePart.split(':')
    const hh = Number(hhStr)
    const mm = Number(mmStr)
    const isPm = String(period).toUpperCase() === 'PM'

    let hour24 = hh % 12
    if (isPm) hour24 += 12

    const hourStr = String(hour24).padStart(2, '0')
    const minuteStr = String(mm).padStart(2, '0')

    const start = `${dateKey}T${hourStr}:${minuteStr}:00`
    const startDate = new Date(start)
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000)
    const end = endDate.toISOString().slice(0, 19) // YYYY-MM-DDTHH:mm:ss

    const payload = {
      medicoId: Number(doctorId),
      start,
      end,
      notes: notes || null,
    }

    const response = await api.post(endpoints.appointments.create, payload)
    return response.data ?? response
  },

  async updateAppointment(id, appointmentData) {
    const url = endpoints.appointments.update(id)
    const response = await api.put(url, appointmentData)
    return response.data ?? response
  },


  async deleteAppointment(id) {
    const url = endpoints.appointments.delete(id)
    const response = await api.delete(url)
    return response.data ?? response
  },
}

export default appointmentsService
