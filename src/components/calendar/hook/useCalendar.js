import moment from 'moment'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { calendarService } from '../../../services'

export function useCalendar() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [view, setView] = useState('month')
  const [date, setDate] = useState(() => new Date())

  const scrollToTime = useMemo(
    () => moment().hours(8).minutes(0).seconds(0).milliseconds(0).toDate(),
    [],
  )

  const handleNavigate = useCallback((nextDate) => {
    setDate(nextDate)
  }, [])

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const start = moment().startOf('month').format('YYYY-MM-DD')
      const end = moment().endOf('month').format('YYYY-MM-DD')

      const fetchedEvents = await calendarService.getEvents(start, end)

      const formattedEvents = fetchedEvents.map((event) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
        allDay: Boolean(event.allDay),
      }))

      setEvents(formattedEvents)
    } catch (err) {
      console.error('Error loading events:', err)
      setError('Failed to load events. Using fallback data.')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const handleSelectEvent = useCallback((event) => {
    console.log('Selected event:', event)
    alert(`Event: ${event.title}\n${event.description || ''}`)
  }, [])

  const handleSelectSlot = useCallback((slotInfo) => {
    console.log('Selected slot:', slotInfo)
    alert(`Create new event for ${moment(slotInfo.start).format('MMMM D, YYYY')}`)
  }, [])

  return {
    events,
    loading,
    error,
    view,
    setView,
    date,
    scrollToTime,
    handleNavigate,
    handleSelectEvent,
    handleSelectSlot,
  }
}

export const EVENT_TYPE_COLORS = {
  meeting: '#4a90d9',
  appointment: '#50c878',
  deadline: '#e74c3c',
  training: '#9b59b6',
  personal: '#f39c12',
}

export function getEventColor(type) {
  return EVENT_TYPE_COLORS[type] ?? EVENT_TYPE_COLORS.meeting
}