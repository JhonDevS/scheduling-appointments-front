import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import {
  isColombianHoliday,
  isSaturday,
  isSunday,
  isWeekday,
  toDateKey,
} from './colombianHolidays'

export function isMonday(date) {
  return date.getDay() === 1
}

/** Franjas cada 30 min: desde startHour (incl.) hasta endHour (excl.; 12 → última 11:30). */
function buildSlots(startHour, endHour) {
  const result = []
  let total = startHour * 60
  const end = endHour * 60
  while (total < end) {
    const h = Math.floor(total / 60)
    const m = total % 60
    result.push(formatTime12h(h, m))
    total += 30
  }
  return result
}

function formatTime12h(hour24, minutes) {
  const period = hour24 >= 12 ? 'PM' : 'AM'
  let h = hour24 % 12
  if (h === 0) h = 12
  return `${String(h).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`
}

export function parseTime12h(timeStr) {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return null
  let h = parseInt(match[1], 10)
  const m = parseInt(match[2], 10)
  const pm = match[3].toUpperCase() === 'PM'
  if (pm && h !== 12) h += 12
  if (!pm && h === 12) h = 0
  return h * 60 + m
}

export function isDateBookable(date) {
  if (isSunday(date)) return false
  // Lunes a viernes y sábados por la mañana son fechas válidas para agendar.
  if (isWeekday(date) || isSaturday(date)) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d >= today
  }
  return false
}

export function getScheduleForDate(date) {
  if (!isDateBookable(date)) {
    return { morning: [], afternoon: [], reason: getDisabledReason(date) }
  }

  if (isSaturday(date)) {
    return {
      morning: buildSlots(8, 12),
      afternoon: [],
      reason: null,
    }
  }

  if (isWeekday(date)) {
    return {
      morning: buildSlots(8, 12),
      afternoon: buildSlots(13, 17),
      reason: null,
    }
  }

  return { morning: [], afternoon: [], reason: 'Día no disponible' }
}

export function getDisabledReason(date) {
  if (isSunday(date)) return 'Los domingos no hay atención'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  if (d < today) return 'Fecha pasada'
  return 'No disponible'
}

export function formatDateLabel(date) {
  return format(date, "d 'de' MMM. yyyy", { locale: es })
}

export function formatDateShort(date) {
  return format(date, 'EEE', { locale: es }).toUpperCase().slice(0, 3)
}

export function getBookableDatesInRange(startDate, count = 42) {
  const dates = []
  const cursor = new Date(startDate)
  cursor.setHours(0, 0, 0, 0)
  let scanned = 0
  const maxScan = 120

  while (dates.length < count && scanned < maxScan) {
    if (isDateBookable(cursor)) {
      dates.push(new Date(cursor))
    }
    cursor.setDate(cursor.getDate() + 1)
    scanned += 1
  }

  return dates
}

export { toDateKey }
