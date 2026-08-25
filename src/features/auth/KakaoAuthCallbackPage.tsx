import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import {
  consumeKakaoLoginReturnTo,
  exchangeKakaoCode,
  validateKakaoOAuthState,
} from '@/api/auth.api'
import { saveAccessToken, saveAuthUser } from '@/api/authToken'
import { routeUrls } from '@/app/router/paths'
import './KakaoAuthCallbackPage.css'

type CallbackState = { status: 'loading' } | { status: 'error'; message: string }

export function KakaoAuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [callbackState, setCallbackState] = useState<CallbackState>({ status: 'loading' })
  const hasStartedRef = useRef(false)

  useEffect(() => {
    if (hasStartedRef.current) return
    hasStartedRef.current = true

    const error = searchParams.get('error')
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (error) {
      setCallbackState({ status: 'error', message: '카카오 로그인이 취소되었거나 거부되었습니다.' })
      return
    }
    if (!code) {
      setCallbackState({ status: 'error', message: '카카오 인가 코드가 전달되지 않았습니다.' })
      return
    }
    if (!validateKakaoOAuthState(state)) {
      setCallbackState({ status: 'error', message: '로그인 요청 상태가 일치하지 않습니다.' })
      return
    }

    void exchangeKakaoCode(code)
      .then((auth) => {
        saveAccessToken(auth.accessToken)
        saveAuthUser({ userId: auth.userId, nickname: auth.nickname, provider: auth.provider })
        void navigate(consumeKakaoLoginReturnTo(), { replace: true })
      })
      .catch((requestError: unknown) => {
        const status = axios.isAxiosError(requestError) ? requestError.response?.status : undefined
        const suffix = status ? ` (HTTP ${status})` : ''
        setCallbackState({
          status: 'error',
          message: `백엔드가 카카오 인가 코드를 처리하지 못했습니다${suffix}.`,
        })
      })
  }, [navigate, searchParams])

  return (
    <main className="auth-callback-page">
      {callbackState.status === 'loading' && (
        <>
          <h1>로그인하고 있어요</h1>
          <p>잠시만 기다려 주세요.</p>
        </>
      )}
      {callbackState.status === 'error' && (
        <>
          <h1>카카오 로그인 확인 실패</h1>
          <p>{callbackState.message}</p>
          <Link to={routeUrls.home()}>홈으로 돌아가기</Link>
        </>
      )}
    </main>
  )
}
