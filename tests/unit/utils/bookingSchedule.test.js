import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getDisabledReason,
  getScheduleForDate,
  isDateBookable,
  parseTime12h,
} from '../../../src/utils/bookingSchedule'

describe('bookingSchedule', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-26T10:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('parsea horas en formato 12h', () => {
    expect(parseTime12h('08:00 AM')).toBe(8 * 60)
    expect(parseTime12h('02:30 PM')).toBe(14 * 60 + 30)
    expect(parseTime12h('12:00 PM')).toBe(12 * 60)
    expect(parseTime12h('invalid')).toBeNull()
  })

  it('no permite domingos ni fechas pasadas', () => {
    const sunday = new Date(2026, 4, 24)
    const pastWeekday = new Date(2026, 4, 25)

    expect(isDateBookable(sunday)).toBe(false)
    expect(isDateBookable(pastWeekday)).toBe(false)
    expect(getDisabledReason(sunday)).toMatch(/domingo/i)
    expect(getDisabledReason(pastWeekday)).toMatch(/fecha pasada/i)
  })

  it('habilita los lunes para agendar citas', () => {
    const monday = new Date(2026, 5, 1)
    const schedule = getScheduleForDate(monday)

    expect(isDateBookable(monday)).toBe(true)
    expect(schedule.morning[0]).toBe('08:00 AM')
    expect(schedule.afternoon[0]).toBe('01:00 PM')
    expect(schedule.reason).toBeNull()
  })

  it('genera franjas de lunes a viernes 8-12 y 13-17', () => {
    const tuesday = new Date(2026, 4, 26)
    const schedule = getScheduleForDate(tuesday)

    expect(schedule.morning[0]).toBe('08:00 AM')
    expect(schedule.morning.at(-1)).toBe('11:30 AM')
    expect(schedule.afternoon[0]).toBe('01:00 PM')
    expect(schedule.afternoon.at(-1)).toBe('04:30 PM')
    expect(schedule.reason).toBeNull()
  })

  it('genera solo franjas de mañana los sábados', () => {
    const saturday = new Date(2026, 4, 30)
    const schedule = getScheduleForDate(saturday)

    expect(schedule.morning.length).toBeGreaterThan(0)
    expect(schedule.afternoon).toHaveLength(0)
  })
})
