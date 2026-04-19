import { mockApi } from '../mocks'

const USE_MOCK = true

export const calendarService = {
  async getEvents(start, end) {
    if (USE_MOCK) {
      return await mockApi.getEvents(start, end)
    }
    
    console.warn('Real API not configured, using mock data')
    return await mockApi.getEvents(start, end)
  },

  async getEventById(id) {
    if (USE_MOCK) {
      return await mockApi.getEventById(id)
    }
    
    console.warn('Real API not configured, using mock data')
    return await mockApi.getEventById(id)
  },

  async createEvent(eventData) {
    if (USE_MOCK) {
      return await mockApi.createEvent(eventData)
    }
    
    console.warn('Real API not configured, using mock data')
    return await mockApi.createEvent(eventData)
  },

  async updateEvent(id, eventData) {
    if (USE_MOCK) {
      return await mockApi.updateEvent(id, eventData)
    }
    
    console.warn('Real API not configured, using mock data')
    return await mockApi.updateEvent(id, eventData)
  },

  async deleteEvent(id) {
    if (USE_MOCK) {
      return await mockApi.deleteEvent(id)
    }
    
    console.warn('Real API not configured, using mock data')
    return await mockApi.deleteEvent(id)
  },
}

export default calendarService