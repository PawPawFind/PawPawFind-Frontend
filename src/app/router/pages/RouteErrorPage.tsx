import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { routeUrls } from '../paths'

export function RouteErrorPage() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : '페이지를 표시하는 중 문제가 발생했습니다.'

  return (
    <main>
      <h1>페이지를 불러오지 못했습니다.</h1>
      <p>{message}</p>
      <Link to={routeUrls.home()}>홈으로 이동</Link>
    </main>
  )
}
