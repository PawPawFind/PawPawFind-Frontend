import { Link } from 'react-router'
import { routeUrls } from '../paths'

export function NotFoundPage() {
  return (
    <main>
      <h1>페이지를 찾을 수 없습니다.</h1>
      <Link to={routeUrls.home()}>홈으로 이동</Link>
    </main>
  )
}
