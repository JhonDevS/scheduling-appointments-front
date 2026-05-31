import TimeSlot, { SLOT_STATUS } from './TimeSlot'
import { resolveSlotStatus } from './timeSlotStatus'

export default function TimeSlotGroup({
  title,
  times,
  selectedTime,
  isSlotBooked,
  isSlotPast,
  onSelectTime,
}) {
  if (!times.length) return null

  return (
    <div className="sy-time-group">
      <h4>{title}</h4>
      <div className="sy-time-slots" role="list" aria-label={title}>
        {times.map((time) => {
          const isBooked = isSlotBooked(time)
          const isPast = isSlotPast(time)
          const status = resolveSlotStatus({ isBooked, isPast })

          return (
            <div key={time} role="listitem">
              <TimeSlot
                time={time}
                status={status}
                isSelected={status === SLOT_STATUS.AVAILABLE && selectedTime === time}
                onSelect={onSelectTime}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
