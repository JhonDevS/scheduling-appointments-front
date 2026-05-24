import { describe, expect, it } from 'vitest'

import { filterBySearch, filterTimelineByDate } from '../../../src/utils/doctorSchedule'

const ITEMS = [
  { patient: 'Marco Verratti', detail: 'Chequeo' },
  { patient: 'Sofía Loren', detail: 'Nuevo' },
]

describe('doctorSchedule', () => {
  it('devuelve todos sin búsqueda', () => {
    expect(filterBySearch(ITEMS, '', ['patient'])).toHaveLength(2)
    expect(filterBySearch(ITEMS, '   ', ['patient'])).toHaveLength(2)
  })

  it('filtra por texto', () => {
    const result = filterBySearch(ITEMS, 'marco', ['patient'])
    expect(result).toHaveLength(1)
    expect(result[0].patient).toMatch(/Marco/)
  })

  it('filtra cronograma por fecha', () => {
    const timeline = [
      { dateKey: 'today', patient: 'A' },
      { dateKey: 'tomorrow', patient: 'B' },
    ]
    expect(filterTimelineByDate(timeline, 'today')).toHaveLength(1)
  })
})
