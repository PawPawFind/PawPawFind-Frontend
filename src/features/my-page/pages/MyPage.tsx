import { Link, useNavigate } from 'react-router'
import { clearAuthSession } from '@/api/authToken'
import { routeUrls } from '@/app/router/paths'
import { useAuth } from '@/hooks/useAuth'
import { useDeleteMyReportMutation } from '../hooks/useDeleteMyReportMutation'
import { useMyReportsQuery } from '../hooks/useMyReportsQuery'
import './MyPage.css'

const speciesLabels: Record<string, string> = { DOG: '강아지', CAT: '고양이' }
const sizeLabels: Record<string, string> = { SMALL: '소형', MEDIUM: '중형', LARGE: '대형' }

export function MyPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data, isError, isPending, refetch } = useMyReportsQuery()
  const deleteReport = useDeleteMyReportMutation()
  const reports = data?.content ?? []

  const logout = () => {
    clearAuthSession()
    void navigate(routeUrls.home(), { replace: true })
  }

  const handleDelete = (reportId: number, title: string) => {
    if (!window.confirm(`“${title}” 글을 삭제할까요? 삭제한 글은 복구할 수 없습니다.`)) return
    deleteReport.mutate(reportId)
  }

  return (
    <main className="my-page">
      <header className="my-page__intro">
        <h1>마이페이지</h1>
      </header>

      <section className="my-page__account-section" aria-labelledby="account-title">
        <p className="my-page__section-label">계정</p>
        <div className="my-page__account">
          <div className="my-page__avatar" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12 4.5c-5 0-9 3.2-9 7.1 0 2.5 1.7 4.7 4.3 6l-1.1 3.9 4.6-3c.4.1.8.1 1.2.1 5 0 9-3.1 9-7s-4-7.1-9-7.1Z" />
            </svg>
          </div>
          <div>
            <h2 id="account-title">{user?.nickname ?? '카카오 소셜 로그인'}</h2>
            <p>{user?.provider === 'KAKAO' ? 'kakao 계정 연결됨' : '로그인된 계정'}</p>
          </div>
        </div>
        <p className="my-page__account-help">
          목격 제보는 로그인 없이 할 수 있어요. 실종 동물 찾기는 등록 내용을 저장하고 새 후보를
          알려드려야 하기 때문에 로그인이 필요해요.
        </p>
      </section>

      <section className="my-page__reports" aria-labelledby="my-reports-title">
        <div className="my-page__section-heading">
          <div>
            <h2 id="my-reports-title">내 제보</h2>
            <p>내가 등록한 실종·목격 제보를 모아봤어요.</p>
          </div>
          {!isPending && !isError && <strong>{data?.totalElements ?? reports.length}건</strong>}
        </div>

        {isPending && (
          <p className="my-page__feedback" role="status">
            내 제보를 불러오는 중입니다.
          </p>
        )}
        {isError && (
          <div className="my-page__feedback" role="alert">
            <p>내 제보를 불러오지 못했습니다.</p>
            <button onClick={() => void refetch()} type="button">
              다시 시도
            </button>
          </div>
        )}
        {!isPending && !isError && reports.length === 0 && (
          <div className="my-page__feedback">
            <p>아직 등록한 제보가 없습니다.</p>
            <Link to={routeUrls.sightingReportForm()}>첫 목격 제보 등록하기</Link>
          </div>
        )}
        {!isPending && !isError && reports.length > 0 && (
          <>
            {deleteReport.isError && (
              <p className="my-page__delete-error" role="alert">
                글을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.
              </p>
            )}
            <ul className="my-page__report-list">
              {reports.map((report) => {
                const isSighting = report.reportType === 'FOUND'
                const isDeleting =
                  deleteReport.isPending && deleteReport.variables === report.reportId
                const title =
                  report.title || `${speciesLabels[report.species] ?? report.species} 실종 제보`
                const content = (
                  <>
                    <span className="my-page__report-summary">
                      <strong>{title}</strong>
                      <span className="my-page__report-meta">
                        <span className="my-page__report-type">
                          <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                            <path d="M12 21s6.5-6 6.5-11a6.5 6.5 0 1 0-13 0c0 5 6.5 11 6.5 11Z" />
                            <circle cx="12" cy="10" r="2.3" />
                          </svg>
                          {isSighting ? '목격 제보' : '실종 제보'}
                        </span>
                        <span className="my-page__report-details">
                          <span className="my-page__report-traits">
                            {speciesLabels[report.species] ?? report.species} ·{' '}
                            {sizeLabels[report.size] ?? report.size} ·{' '}
                          </span>
                          <span className="my-page__report-place" title={report.happenPlace}>
                            {report.happenPlace}
                          </span>
                        </span>
                      </span>
                    </span>
                    <time dateTime={report.eventDate}>{report.eventDate.replace(/-/g, '.')}</time>
                  </>
                )
                return (
                  <li key={report.reportId}>
                    <Link
                      className="my-page__report-content"
                      to={
                        isSighting
                          ? routeUrls.sightingReportDetail(String(report.reportId))
                          : routeUrls.lostReportDetail(String(report.reportId))
                      }
                    >
                      {content}
                    </Link>
                    <button
                      aria-busy={isDeleting}
                      aria-label={isDeleting ? `${title} 삭제 중` : `${title} 삭제`}
                      className="my-page__delete-button"
                      disabled={deleteReport.isPending}
                      onClick={() => handleDelete(report.reportId, title)}
                      type="button"
                    >
                      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                        <path d="M4 7h16" />
                        <path d="M9 3.5h6L16 7H8l1-3.5Z" />
                        <path d="m6.5 7 1 13h9l1-13" />
                        <path d="M10 11v5M14 11v5" />
                      </svg>
                    </button>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </section>

      <section className="my-page__settings" aria-labelledby="settings-title">
        <h2 className="my-page__section-label" id="settings-title">
          기타
        </h2>
        <div className="my-page__settings-list">
          <div>
            <span>데이터 출처</span>
            <small>국가동물보호정보시스템</small>
          </div>
          <div>
            <span>버전</span>
            <small>0.1.0</small>
          </div>
          <button onClick={logout} type="button">
            로그아웃
          </button>
        </div>
      </section>
    </main>
  )
}
