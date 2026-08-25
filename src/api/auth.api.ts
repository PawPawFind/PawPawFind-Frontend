import { apiClient } from './client'
import { env } from '@/config/env'

const KAKAO_OAUTH_STATE_KEY = 'pawpawfind.kakaoOAuthState'
const KAKAO_OAUTH_RETURN_TO_KEY = 'pawpawfind.kakaoOAuthReturnTo'

export interface AuthResponse {
  accessToken: string
  userId: number
  nickname: string
  provider: string
}

export function createOAuthState() {
  // HTTP에서도 사용할 수 있는 Web Crypto 난수로 OAuth state를 만든다.
  const randomBytes = new Uint8Array(32)
  crypto.getRandomValues(randomBytes)

  return Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function login(returnTo?: string) {
  if (!env.kakaoRestApiKey) throw new Error('카카오 로그인 REST API 키가 설정되지 않았습니다.')

  const state = createOAuthState()
  const redirectUri = `${window.location.origin}/auth/kakao/callback`
  const authorizeUrl = new URL('https://kauth.kakao.com/oauth/authorize')

  authorizeUrl.searchParams.set('client_id', env.kakaoRestApiKey)
  authorizeUrl.searchParams.set('redirect_uri', redirectUri)
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('state', state)
  sessionStorage.setItem(KAKAO_OAUTH_STATE_KEY, state)
  if (returnTo?.startsWith('/') && !returnTo.startsWith('//')) {
    sessionStorage.setItem(KAKAO_OAUTH_RETURN_TO_KEY, returnTo)
  } else {
    sessionStorage.removeItem(KAKAO_OAUTH_RETURN_TO_KEY)
  }
  window.location.assign(authorizeUrl)
}

export function consumeKakaoLoginReturnTo() {
  const returnTo = sessionStorage.getItem(KAKAO_OAUTH_RETURN_TO_KEY)
  sessionStorage.removeItem(KAKAO_OAUTH_RETURN_TO_KEY)

  return returnTo?.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/'
}

export function validateKakaoOAuthState(state: string | null) {
  const expectedState = sessionStorage.getItem(KAKAO_OAUTH_STATE_KEY)
  sessionStorage.removeItem(KAKAO_OAUTH_STATE_KEY)
  return Boolean(state && expectedState && state === expectedState)
}

export async function exchangeKakaoCode(code: string) {
  const { data } = await apiClient.post<AuthResponse>('/api/auth/kakao', { code })
  return data
}
