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
    const payload = {
      ...appointmentData,
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
