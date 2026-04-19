// Mock Data Exports
// This file exports all mock data for use in development

import appointments from './data/appointments.json'
import events from './data/events.json'

export const mockData = {
  events,
  appointments,
}


export const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

export const mockApi = {  
  async getEvents(start, end) {
    await delay()
    if (start && end) {
      return events.filter(event => {
        const eventDate = new Date(event.start)
        return eventDate >= new Date(start) && eventDate <= new Date(end)
      })
    }
    return events
  },
  
  async getEventById(id) {
    await delay()
    return events.find(event => event.id === parseInt(id))
  },
  
  async createEvent(eventData) {
    await delay()
    const newEvent = {
      id: events.length + 1,
      ...eventData,
    }
    events.push(newEvent)
    return newEvent
  },
  
  async updateEvent(id, eventData) {
    await delay()
    const index = events.findIndex(event => event.id === parseInt(id))
    if (index !== -1) {
      events[index] = { ...events[index], ...eventData }
      return events[index]
    }
    throw new Error('Event not found')
  },
  
  async deleteEvent(id) {
    await delay()
    const index = events.findIndex(event => event.id === parseInt(id))
    if (index !== -1) {
      events.splice(index, 1)
      return { success: true }
    }
    throw new Error('Event not found')
  },
  
  async getAppointments(start, end) {
    await delay()
    if (start && end) {
      return appointments.filter(apt => {
        const aptDate = new Date(apt.start)
        return aptDate >= new Date(start) && aptDate <= new Date(end)
      })
    }
    return appointments
  },
  
  async getAppointmentById(id) {
    await delay()
    return appointments.find(apt => apt.id === parseInt(id))
  },
  
  async createAppointment(appointmentData) {
    await delay()
    const newAppointment = {
      id: appointments.length + 1,
      ...appointmentData,
    }
    appointments.push(newAppointment)
    return newAppointment
  },
  
  async updateAppointment(id, appointmentData) {
    await delay()
    const index = appointments.findIndex(apt => apt.id === parseInt(id))
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...appointmentData }
      return appointments[index]
    }
    throw new Error('Appointment not found')
  },
  
  async deleteAppointment(id) {
    await delay()
    const index = appointments.findIndex(apt => apt.id === parseInt(id))
    if (index !== -1) {
      appointments.splice(index, 1)
      return { success: true }
    }
    throw new Error('Appointment not found')
  },
}

export default mockApi