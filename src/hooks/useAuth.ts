import { useSyncExternalStore } from 'react'
import {
  getAccessToken,
  getAuthSessionSnapshot,
  getAuthUser,
  subscribeAuthSession,
} from '@/api/authToken'

export function useAuth() {
  useSyncExternalStore(subscribeAuthSession, getAuthSessionSnapshot, getAuthSessionSnapshot)

  return {
    isAuthenticated: Boolean(getAccessToken()),
    user: getAuthUser(),
  }
}
