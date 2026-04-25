import { mockApi } from '../mocks'

const USE_MOCK = true

export const appointmentsService = {

  async getAllAppointments() {
    if (USE_MOCK) {
      return await mockApi.getAppointments()
    }
    
    
    console.warn('Real API not configured, using mock data')
    return await mockApi.getAppointments()
  },

  async getAppointmentsByDateRange(start, end) {
    if (USE_MOCK) {
      return await mockApi.getAppointments(start, end)
    }
    
    console.warn('Real API not configured, using mock data')
    return await mockApi.getAppointments(start, end)
  },

  async getAppointmentById(id) {
    if (USE_MOCK) {
      return await mockApi.getAppointmentById(id)
    }
    
    
    console.warn('Real API not configured, using mock data')
    return await mockApi.getAppointmentById(id)
  },

  async createAppointment(appointmentData) {
    if (USE_MOCK) {
      return await mockApi.createAppointment(appointmentData)
    }
    
    console.warn('Real API not configured, using mock data')
    return await mockApi.createAppointment(appointmentData)
  },

  async updateAppointment(id, appointmentData) {
    if (USE_MOCK) {
      return await mockApi.updateAppointment(id, appointmentData)
    }
    
    console.warn('Real API not configured, using mock data')
    return await mockApi.updateAppointment(id, appointmentData)
  },


  async deleteAppointment(id) {
    if (USE_MOCK) {
      return await mockApi.deleteAppointment(id)
    }

    console.warn('Real API not configured, using mock data')
    return await mockApi.deleteAppointment(id)
  },
}

export default appointmentsService