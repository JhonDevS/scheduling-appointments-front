/**
 * Festivos en Colombia (fechas ISO YYYY-MM-DD).
 * Incluye años cercanos para navegación del calendario de citas.
 */
const HOLIDAYS = new Set([
  // 2025
  '2025-01-01', '2025-01-06', '2025-03-24', '2025-04-17', '2025-04-18',
  '2025-05-01', '2025-06-02', '2025-06-23', '2025-06-30', '2025-07-20',
  '2025-08-07', '2025-08-18', '2025-10-13', '2025-11-03', '2025-11-17',
  '2025-12-08', '2025-12-25',
  // 2026
  '2026-01-01', '2026-01-12', '2026-03-23', '2026-04-02', '2026-04-03',
  '2026-05-01', '2026-05-25', '2026-06-15', '2026-06-29', '2026-07-20',
  '2026-08-07', '2026-08-17', '2026-10-12', '2026-11-02', '2026-11-16',
  '2026-12-08', '2026-12-25',
  // 2027
  '2027-01-01', '2027-01-11', '2027-03-22', '2027-03-25', '2027-03-26',
  '2027-05-01', '2027-05-17', '2027-06-07', '2027-06-28', '2027-07-20',
  '2027-08-07', '2027-08-16', '2027-10-18', '2027-11-01', '2027-11-15',
  '2027-12-08', '2027-12-25',
])

export const SOUTH_AMERICA_TIME_ZONE = 'America/Bogota'

export function toDateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getDateInTimeZone(date, timeZone = SOUTH_AMERICA_TIME_ZONE) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = formatter.formatToParts(date)
  const values = {}
  for (const part of parts) {
    if (part.type === 'year' || part.type === 'month' || part.type === 'day') {
      values[part.type] = part.value
    }
  }
  if (!values.year || !values.month || !values.day) return null
  return new Date(Number(values.year), Number(values.month) - 1, Number(values.day))
}

export function getTodayKey(timeZone = SOUTH_AMERICA_TIME_ZONE) {
  const today = getDateInTimeZone(new Date(), timeZone)
  return today ? toDateKey(today) : toDateKey(new Date())
}

export function getMonthStartKey(date = new Date(), timeZone = SOUTH_AMERICA_TIME_ZONE) {
  const tzDate = getDateInTimeZone(date, timeZone)
  if (!tzDate) return toDateKey(new Date(date.getFullYear(), date.getMonth(), 1))
  return toDateKey(new Date(tzDate.getFullYear(), tzDate.getMonth(), 1))
}

export function parseDateKey(dateKey) {
  if (!dateKey) return null
  const parts = String(dateKey).split('-')
  if (parts.length !== 3) return null
  const [year, month, day] = parts.map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

export function isColombianHoliday(date) {
  return HOLIDAYS.has(toDateKey(date))
}

export function isSunday(date) {
  return date.getDay() === 0
}

export function isSaturday(date) {
  return date.getDay() === 6
}

export function isWeekday(date) {
  const day = date.getDay()
  return day >= 1 && day <= 5
}
