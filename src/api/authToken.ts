export const AUTH_ACCESS_TOKEN_KEY = 'pawpawfind.accessToken'
const AUTH_USER_KEY = 'pawpawfind.authUser'
const AUTH_SESSION_CHANGE_EVENT = 'pawpawfind:auth-session-change'

function notifyAuthSessionChange() {
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGE_EVENT))
}

export interface AuthUser {
  userId: number
  nickname: string
  provider: string
}

export function getAccessToken() {
  return localStorage.getItem(AUTH_ACCESS_TOKEN_KEY)
}

export function saveAccessToken(accessToken: string) {
  localStorage.setItem(AUTH_ACCESS_TOKEN_KEY, accessToken)
  notifyAuthSessionChange()
}

export function getAuthUser(): AuthUser | null {
  const serializedUser = localStorage.getItem(AUTH_USER_KEY)
  if (!serializedUser) return null

  try {
    return JSON.parse(serializedUser) as AuthUser
  } catch {
    localStorage.removeItem(AUTH_USER_KEY)
    return null
  }
}

export function saveAuthUser(user: AuthUser) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  notifyAuthSessionChange()
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_ACCESS_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
  notifyAuthSessionChange()
}

export function getAuthSessionSnapshot() {
  return `${localStorage.getItem(AUTH_ACCESS_TOKEN_KEY) ?? ''}\u0000${localStorage.getItem(AUTH_USER_KEY) ?? ''}`
}

export function subscribeAuthSession(onStoreChange: () => void) {
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === AUTH_ACCESS_TOKEN_KEY || event.key === AUTH_USER_KEY || event.key === null) {
      onStoreChange()
    }
  }

  window.addEventListener(AUTH_SESSION_CHANGE_EVENT, onStoreChange)
  window.addEventListener('storage', handleStorageChange)

  return () => {
    window.removeEventListener(AUTH_SESSION_CHANGE_EVENT, onStoreChange)
    window.removeEventListener('storage', handleStorageChange)
  }
}
