import { SLOT_LABELS, SLOT_STATUS, SLOT_TITLES } from './timeSlotStatus'

function TimeSlot({ time, status, isSelected, onSelect }) {
  const isReadOnly = status !== SLOT_STATUS.AVAILABLE
  const label = SLOT_LABELS[status]
  const title = SLOT_TITLES[status]

  if (isReadOnly) {
    return (
      <div
        className={`sy-time-slot sy-time-slot--readonly sy-time-slot--${status}`}
        title={title}
        aria-disabled="true"
        aria-label={`${time}, ${label}`}
      >
        <span className="sy-time-slot__time">{time}</span>
        <span className="sy-time-slot__badge">{label}</span>
      </div>
    )
  }

  return (
    <button
      type="button"
      className={`sy-time-slot sy-time-slot--selectable ${isSelected ? 'is-selected' : ''}`}
      title={title}
      aria-pressed={isSelected}
      aria-label={`${time}, disponible`}
      onClick={() => onSelect(time)}
    >
      <span className="sy-time-slot__time">{time}</span>
    </button>
  )
}

export { TimeSlot as default, SLOT_STATUS }
