import { describe, expect, it } from 'vitest'

import {
  isColombianHoliday,
  isSaturday,
  isSunday,
  isWeekday,
  toDateKey,
} from '../../../src/utils/colombianHolidays'

describe('colombianHolidays', () => {
  it('formatea la clave de fecha en ISO local', () => {
    const date = new Date(2026, 4, 26)
    expect(toDateKey(date)).toBe('2026-05-26')
  })

  it('detecta festivos de Colombia', () => {
    expect(isColombianHoliday(new Date(2026, 0, 1))).toBe(true)
    expect(isColombianHoliday(new Date(2026, 4, 25))).toBe(true)
    expect(isColombianHoliday(new Date(2026, 4, 26))).toBe(false)
  })

  it('identifica domingo y sábado', () => {
    expect(isSunday(new Date(2026, 4, 24))).toBe(true)
    expect(isSaturday(new Date(2026, 4, 23))).toBe(true)
    expect(isWeekday(new Date(2026, 4, 26))).toBe(true)
  })
})
