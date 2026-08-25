import { describe, expect, it } from 'vitest'
import { createOAuthState } from './auth.api'

describe('createOAuthState', () => {
  it('Web Crypto 난수로 256비트 state를 생성한다', () => {
    expect(createOAuthState()).toMatch(/^[0-9a-f]{64}$/)
  })
})
