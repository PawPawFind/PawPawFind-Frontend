import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { server } from '@/mocks/server'

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
