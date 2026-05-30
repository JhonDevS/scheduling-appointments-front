import { describe, expect, it, vi } from 'vitest'

import { downloadTextFile } from '../../../src/utils/downloadFile'

describe('downloadTextFile', () => {
  it('crea enlace de descarga y lo dispara', () => {
    const click = vi.fn()
    const anchor = { click, href: '', download: '' }
    vi.spyOn(document, 'createElement').mockReturnValue(anchor)
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    downloadTextFile('test.txt', 'contenido')

    expect(anchor.download).toBe('test.txt')
    expect(click).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test')
  })
})
