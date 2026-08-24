import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { routeUrls } from '../paths'

interface AuthRedirectState {
  authRequired: true
  returnTo: string
}

export function RequireAuth() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    const state: AuthRedirectState = {
      authRequired: true,
      returnTo: `${location.pathname}${location.search}${location.hash}`,
    }

    return <Navigate replace state={state} to={routeUrls.home()} />
  }

  return <Outlet />
}

export type { AuthRedirectState }
