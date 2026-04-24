import 'react-big-calendar/lib/css/react-big-calendar.css'
import './css/Calendar.css'

import moment from 'moment'
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar'

import { getEventColor,useCalendar } from './hook'

const localizer = momentLocalizer(moment)

function Calendar() {
  const {
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
  } = useCalendar()

  return (
    <div className="calendar-container">
      <h2 className="calendar-title">Calendario</h2>

      {loading && <div className="calendar-loading">Cargando eventos...</div>}

      {error && (
        <div className="calendar-error">{error}</div>
      )}

      <div className="calendar-wrapper">
        <BigCalendar
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
            style: { backgroundColor: getEventColor(event.type) },
          })}
        />
      </div>
    </div>
  )
}

export default Calendar