/** Estados de una franja horaria en la agenda. */
export const SLOT_STATUS = {
  AVAILABLE: 'available',
  BOOKED: 'booked',
  PAST: 'past',
}

export function resolveSlotStatus({ isBooked, isPast }) {
  if (isBooked) return SLOT_STATUS.BOOKED
  if (isPast) return SLOT_STATUS.PAST
  return SLOT_STATUS.AVAILABLE
}

export const SLOT_LABELS = {
  [SLOT_STATUS.BOOKED]: 'No disponible',
  [SLOT_STATUS.PAST]: 'Horario pasado',
  [SLOT_STATUS.AVAILABLE]: null,
}

export const SLOT_TITLES = {
  [SLOT_STATUS.BOOKED]: 'Franja ocupada por otra cita de este profesional',
  [SLOT_STATUS.PAST]: 'Este horario ya no puede reservarse',
  [SLOT_STATUS.AVAILABLE]: 'Seleccionar este horario',
}
