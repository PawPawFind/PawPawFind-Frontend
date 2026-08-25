import { useState, type MouseEvent } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { login } from '@/api/auth.api'
import { LoginSheet } from '@/features/auth'
import { useAuth } from '@/hooks/useAuth'
import { routeUrls } from '../paths'
import './AppLayout.css'

export function AppLayout() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [loginReturnTo, setLoginReturnTo] = useState<string>(routeUrls.home())

  const handleFindClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (isAuthenticated) return

    event.preventDefault()
    const destination = new URL(event.currentTarget.href)
    setLoginReturnTo(`${destination.pathname}${destination.search}${destination.hash}`)
    setIsLoginOpen(true)
  }

  return (
    <>
      <header className="app-header">
        <div className="app-header__inner">
          <NavLink className="app-header__brand" to={routeUrls.home()}>
            <span aria-hidden="true">🐾</span> PawPawFind
          </NavLink>
          <nav aria-label="주요 메뉴">
            <NavLink end to={routeUrls.sightingReports()}>
              목격 제보
            </NavLink>
            <NavLink onClick={handleFindClick} to={routeUrls.missingAnimalSearch()}>
              실종 동물 찾기
            </NavLink>
          </nav>
          {isAuthenticated && (
            <NavLink aria-label="마이페이지" className="app-header__mypage" to={routeUrls.myPage()}>
              <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="M5.75 19c.55-3.35 3-5.35 6.25-5.35s5.7 2 6.25 5.35"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.6"
                />
              </svg>
            </NavLink>
          )}
        </div>
      </header>
      <Outlet context={{ handleFindClick }} />
      {location.pathname === routeUrls.home() && (
        <footer className="app-footer">
          <div className="app-footer__main">
            <div className="app-footer__summary">
              <Link className="app-footer__brand" to={routeUrls.home()}>
                <span aria-hidden="true">🐾</span> PawPawFind
              </Link>
              <p>잃어버린 반려동물을 보호소 공고와 이웃의 목격 제보로 함께 찾습니다.</p>
            </div>
            <div className="app-footer__group">
              <strong>서비스</strong>

              <Link to={routeUrls.sightingReports()}>목격 제보 목록</Link>
              <Link onClick={handleFindClick} to={routeUrls.missingAnimalSearch()}>
                실종 동물 찾기
              </Link>
            </div>
            <div className="app-footer__group">
              <strong>데이터</strong>
              <span>국가동물보호정보시스템 공공데이터</span>
              <small>보호소 공고는 매일 갱신, 목격 제보는 이용자가 등록합니다.</small>
            </div>
            <div className="app-footer__group">
              <strong>문의</strong>
              <a href="mailto:help@pawpawfind.kr">help@pawpawfind.kr</a>
              <small>버전 0.1.0</small>
            </div>
          </div>
          <div className="app-footer__legal">
            <div>
              <span>© 2026 PawPawFind</span>
              <span>개인정보처리방침</span>
              <span>이용약관</span>
            </div>
          </div>
        </footer>
      )}
      {isLoginOpen && (
        <LoginSheet
          onDismiss={() => setIsLoginOpen(false)}
          onKakaoLogin={() => void login(loginReturnTo)}
        />
      )}
    </>
  )
}
