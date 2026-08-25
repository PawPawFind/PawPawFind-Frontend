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

export function login(returnTo?: string) {
  if (!env.kakaoRestApiKey) throw new Error('카카오 로그인 REST API 키가 설정되지 않았습니다.')

  const state = crypto.randomUUID()
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
