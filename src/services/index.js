
export { default as api } from './api'
export { default as appointmentsService } from './appointmentsService'
export { default as calendarService } from './calendarService'
export { default as endpoints } from './endpoints'

import appointmentsService from './appointmentsService'
import calendarService from './calendarService'

export const services = {
  calendar: calendarService,
  appointments: appointmentsService,
}

export default services