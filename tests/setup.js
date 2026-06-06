import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { JSDOM } from 'jsdom'
import { afterEach, beforeEach, vi } from 'vitest'

function ensureWebStorage() {
  const storageWorks =
    typeof globalThis.localStorage?.clear === 'function' &&
    typeof globalThis.sessionStorage?.clear === 'function'

  if (storageWorks) return

  const dom = new JSDOM('', { url: 'http://localhost/' })
  vi.stubGlobal('localStorage', dom.window.localStorage)
  vi.stubGlobal('sessionStorage', dom.window.sessionStorage)
}

ensureWebStorage()

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})
