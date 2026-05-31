import api from './api'
import { endpoints } from './endpoints'

export const calendarService = {
  async getEvents(start, end) {
    const url = start && end ? endpoints.calendar.getEvents(start, end) : '/calendar/events'
    const response = await api.get(url)
    if (Array.isArray(response.data)) return response.data
    if (Array.isArray(response)) return response
    return []
  },

  async getEventById(id) {
    const url = endpoints.calendar.getEventById(id)
    const response = await api.get(url)
    return response.data ?? response
  },

  async createEvent(eventData) {
    const response = await api.post(endpoints.calendar.createEvent, eventData)
    return response.data ?? response
  },

  async updateEvent(id, eventData) {
    const url = endpoints.calendar.updateEvent(id)
    const response = await api.put(url, eventData)
    return response.data ?? response
  },

  async deleteEvent(id) {
    const url = endpoints.calendar.deleteEvent(id)
    const response = await api.delete(url)
    return response.data ?? response
  },
}

export default calendarService
