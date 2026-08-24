import axios from 'axios'
import { getAccessToken } from './authToken'
import { env } from '@/config/env'

export const apiClient = axios.create({
  baseURL: env.enableMsw ? undefined : env.apiBaseUrl || undefined,
  timeout: 20_000,
  headers: {
    Accept: 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken()
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})
