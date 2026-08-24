const isEnabled = (value: string | undefined) => value === 'true'

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  kakaoMapAppKey: import.meta.env.VITE_KAKAO_MAP_APP_KEY ?? '',
  kakaoRestApiKey: import.meta.env.VITE_KAKAO_REST_API_KEY ?? '',
  enableMsw: import.meta.env.DEV && isEnabled(import.meta.env.VITE_ENABLE_MSW),
} as const
