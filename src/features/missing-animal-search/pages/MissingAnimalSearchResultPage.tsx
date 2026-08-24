import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { routeUrls } from '@/app/router/paths'
import { useMissingAnimalSearchResultsQuery } from '../hooks/useMissingAnimalSearch'
import './MissingAnimalSearchResultPage.css'

type ResultSource = 'SHELTER' | 'SIGHTING' | 'LOST'
type ResultFilter = 'ALL' | ResultSource

const FILTERS: { label: string; value: ResultFilter }[] = [
  { label: '전체', value: 'ALL' },
  { label: '보호소', value: 'SHELTER' },
  { label: '목격 제보', value: 'SIGHTING' },
  { label: '실종 동물', value: 'LOST' },
]

const sourceLabels: Record<ResultSource, string> = {
  SHELTER: '보호소 보호 중',
  SIGHTING: '목격 제보',
  LOST: '등록된 실종 동물',
}

export function MissingAnimalSearchResultPage() {
  const { searchId } = useParams<{ searchId: string }>()
  const [filter, setFilter] = useState<ResultFilter>('ALL')
  const resultsQuery = useMissingAnimalSearchResultsQuery(searchId)
  const allCandidates = resultsQuery.data ?? []
  const candidates = allCandidates.filter(
    (candidate) => filter === 'ALL' || candidate.source === filter,
  )

  return (
    <main className="missing-animal-results-page">
      <header className="missing-animal-results-page__header">
        <div aria-label="검색 결과 출처" className="missing-animal-results-page__filters">
          {FILTERS.map((option) => (
            <button
              aria-pressed={filter === option.value}
              key={option.value}
              onClick={() => setFilter(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
        <h1>비슷한 동물 검색 결과</h1>
        <p>입력한 사진과 정보를 바탕으로 유사도가 높은 순서대로 보여드려요.</p>
      </header>

      {resultsQuery.isPending ? (
        <p className="missing-animal-results-page__status" role="status">
          검색 결과를 불러오는 중입니다.
        </p>
      ) : resultsQuery.isError ? (
        <section className="missing-animal-results-page__empty" role="alert">
          <span aria-hidden="true">🐾</span>
          <h2>검색 결과를 불러오지 못했어요</h2>
          <p>잠시 후 다시 시도해 주세요.</p>
          <button onClick={() => resultsQuery.refetch()} type="button">
            다시 시도
          </button>
        </section>
      ) : allCandidates.length === 0 ? (
        <section className="missing-animal-results-page__empty">
          <span aria-hidden="true">🐾</span>
          <h2>아직 비슷한 동물을 찾지 못했어요</h2>
          <p>
            새로운 보호소 공고와 목격 제보가 등록되면 결과가 달라질 수 있어요.
            <br />
            사진이나 정보를 바꿔 다시 검색해 보세요.
          </p>
          <div>
            <Link to={routeUrls.missingAnimalSearchForm()}>정보 수정해서 다시 찾기</Link>
            <Link to={routeUrls.sightingReports()}>목격 제보 둘러보기</Link>
          </div>
        </section>
      ) : (
        <section aria-label="비슷한 동물 후보" className="missing-animal-results-page__grid">
          {candidates.map((candidate) => (
            <Link
              aria-label={`${candidate.summary} 후보 상세 보기`}
              className="missing-animal-result-card__link"
              key={candidate.id}
              to={
                candidate.source === 'SHELTER'
                  ? routeUrls.shelterNoticeDetail(candidate.targetId)
                  : candidate.source === 'LOST'
                    ? routeUrls.lostReportDetail(candidate.targetId)
                    : routeUrls.sightingReportDetail(candidate.targetId)
              }
            >
              <article className="missing-animal-result-card">
                <img alt={`${candidate.summary} 후보 사진`} src={candidate.imageUrl} />
                <div className="missing-animal-result-card__content">
                  <div className="missing-animal-result-card__similarity">
                    <span aria-hidden="true">
                      <span style={{ width: `${candidate.similarity}%` }} />
                    </span>
                    <strong>유사도 {candidate.similarity}점</strong>
                  </div>
                  <h2>{candidate.summary}</h2>
                  <p className="missing-animal-result-card__area" title={candidate.area}>
                    {candidate.area}
                  </p>
                  <time dateTime={candidate.date.replace(/\./g, '-')}>{candidate.date}</time>
                  <span className="missing-animal-result-card__source">
                    {candidate.source === 'SHELTER' ? (
                      <>
                        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                          <path d="M4 10.5 12 4l8 6.5V20H4v-9.5Z" />
                          <path d="M9.5 20v-6h5v6" />
                        </svg>
                        보호소 보호 중
                      </>
                    ) : (
                      <>
                        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                          <path d="M12 21s6.5-6 6.5-11a6.5 6.5 0 1 0-13 0c0 5 6.5 11 6.5 11Z" />
                          <circle cx="12" cy="10" r="2.3" />
                        </svg>
                        {sourceLabels[candidate.source]}
                      </>
                    )}
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </section>
      )}
    </main>
  )
}
