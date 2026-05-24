import { beforeEach, describe, expect, it } from 'vitest'

import { usePrescriptionRenewalsStore } from '../../../src/store/prescriptionRenewalsStore'
import { resetPrescriptionRenewalsStore } from '../../helpers/store'

describe('prescriptionRenewalsStore', () => {
  beforeEach(() => {
    resetPrescriptionRenewalsStore()
  })

  it('solicita renovación', () => {
    const result = usePrescriptionRenewalsStore.getState().requestRenewal('Amoxicilina')
    expect(result.success).toBe(true)
    expect(usePrescriptionRenewalsStore.getState().isPending('Amoxicilina')).toBe(true)
  })

  it('evita duplicados pendientes', () => {
    usePrescriptionRenewalsStore.getState().requestRenewal('Lisinopril')
    const result = usePrescriptionRenewalsStore.getState().requestRenewal('Lisinopril')
    expect(result.success).toBe(false)
  })
})
