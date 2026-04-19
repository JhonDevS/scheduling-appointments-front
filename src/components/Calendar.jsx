import 'react-big-calendar/lib/css/react-big-calendar.css'

import moment from 'moment'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar'

import { calendarService } from '../services'

const localizer = momentLocalizer(moment)

const MyCalendar = () => {
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

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const start = moment().startOf('month').format('YYYY-MM-DD')
      const end = moment().endOf('month').format('YYYY-MM-DD')
      
      // Fetch events from service (using mock data for now)
      const fetchedEvents = await calendarService.getEvents(start, end)
      
      // Spread first, then coerce start/end to Date — JSON strings must not win (TimeGrid calls getFullYear etc.)
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
      // Fallback to empty array or mock data if service fails
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectEvent = (event) => {
    // Handle event selection - could open a modal or detail view
    console.log('Selected event:', event)
    alert(`Event: ${event.title}\n${event.description || ''}`)
  }

  const handleSelectSlot = (slotInfo) => {
    // Handle slot selection - could open a modal to create new event
    console.log('Selected slot:', slotInfo)
    alert(`Create new event for ${moment(slotInfo.start).format('MMMM D, YYYY')}`)
  }

  return (
    <div className="p-4 bg-white shadow rounded-lg text-left">
      <h2 className="text-xl font-bold mb-4">Calendar</h2>
      
      {loading && (
        <div className="text-center py-4 text-gray-500">
          Loading events...
        </div>
      )}
      
      {error && (
        <div className="text-center py-4 text-red-500 bg-red-50 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="flex h-144 min-h-112 flex-col md:h-160 [&_.rbc-calendar]:h-full [&_.rbc-calendar]:min-h-0 [&_.rbc-calendar]:flex-auto">
        <BigCalendar
          className="h-full"
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          date={date}
          onNavigate={handleNavigate}
          views={['month', 'week', 'day']}
          scrollToTime={scrollToTime}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          eventPropGetter={(event) => ({
            className: `rounded px-1 py-0.5 text-xs text-white ${getEventColorClass(event.type)}`,
          })}
        />
      </div>
    </div>
  )
}

const EVENT_TYPE_COLOR_CLASS = {
  meeting: 'bg-[#4a90d9]',
  appointment: 'bg-[#50c878]',
  deadline: 'bg-[#e74c3c]',
  training: 'bg-[#9b59b6]',
  personal: 'bg-[#f39c12]',
}

const getEventColorClass = (type) => EVENT_TYPE_COLOR_CLASS[type] ?? 'bg-[#4a90d9]'

export default MyCalendar