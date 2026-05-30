import { beforeEach, describe, expect, it } from 'vitest'

import { useDoctorAvailabilityStore, validateAvailabilitySlot } from '../../../src/store/doctorAvailabilityStore'
import { resetDoctorAvailabilityStore } from '../../helpers/store'

describe('doctorAvailabilityStore', () => {
  beforeEach(() => {
    resetDoctorAvailabilityStore()
  })

  it('valida horario inválido', () => {
    expect(validateAvailabilitySlot({ date: '', startTime: '09:00', endTime: '10:00' }).valid).toBe(false)
    expect(validateAvailabilitySlot({ date: '2024-10-24', startTime: '12:00', endTime: '10:00' }).valid).toBe(
      false,
    )
  })

  it('agrega slot válido', () => {
    const result = useDoctorAvailabilityStore.getState().addSlot({
      date: '2024-10-24',
      startTime: '09:00',
      endTime: '12:00',
    })
    expect(result.success).toBe(true)
    expect(useDoctorAvailabilityStore.getState().slots).toHaveLength(1)
    expect(useDoctorAvailabilityStore.getState().getSlotsForDate('2024-10-24')).toHaveLength(1)
  })

  it('rechaza slot inválido en store', () => {
    const result = useDoctorAvailabilityStore.getState().addSlot({
      date: '2024-10-24',
      startTime: '14:00',
      endTime: '10:00',
    })
    expect(result.success).toBe(false)
  })
})
