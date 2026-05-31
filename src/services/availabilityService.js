import api from './api'
import { endpoints } from './endpoints'

export const availabilityService = {
  async getDoctorBaseAvailability(doctorId) {
    const url = endpoints.availability.getDoctorBase(doctorId)
    const response = await api.get(url)
    // backend: { success, message, data } -> interceptor entrega ese objeto
    if (Array.isArray(response.data)) return response.data
    if (Array.isArray(response)) return response
    return []
  },

  async addDoctorBaseSlot(doctorId, slot) {
    const url = endpoints.availability.getDoctorBase(doctorId)
    const response = await api.post(url, slot)
    return response.data ?? response
  },
}

export default availabilityService
