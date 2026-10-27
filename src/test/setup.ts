import '@testing-library/jest-dom/vitest'
import { transferableAbortController } from 'node:util'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { server } from '@/mocks/server'

// React Router creates Node Request instances, so their signals must come from
// the same realm instead of jsdom's AbortController implementation.
const nodeAbortController = transferableAbortController()
Object.defineProperties(globalThis, {
  AbortController: {
    configurable: true,
    value: nodeAbortController.constructor,
  },
  AbortSignal: {
    configurable: true,
    value: nodeAbortController.signal.constructor,
  },
})

vi.mock('lottie-web', () => ({
  default: {
    loadAnimation: () => ({
      addEventListener: vi.fn(),
      destroy: vi.fn(),
      goToAndStop: vi.fn(),
      play: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  },
}))

Object.defineProperty(URL, 'createObjectURL', {
  configurable: true,
  value: vi.fn((blob: Blob) => `blob:${blob instanceof File ? blob.name : 'preview'}`),
})

Object.defineProperty(URL, 'revokeObjectURL', {
  configurable: true,
  value: vi.fn(),
})

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  cleanup()
  server.resetHandlers()
  localStorage.clear()
  sessionStorage.clear()
})

afterAll(() => server.close())
