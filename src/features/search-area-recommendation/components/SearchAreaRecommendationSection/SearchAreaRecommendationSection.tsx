import { useSearchAreaRecommendationMutation } from '../../hooks/useSearchAreaRecommendation'
import { useReverseGeocodedAddresses } from '../../hooks/useReverseGeocodedAddresses'
import { SearchAreaRecommendationError } from '../../api/searchAreaRecommendation.api'
import { priorityColorForRank, SearchAreaRecommendationMap } from '../SearchAreaRecommendationMap'
import './SearchAreaRecommendationSection.css'
import type { SearchAreaItem } from '../../types'

interface SearchAreaRecommendationSectionProps {
  reportId: string
}
const EMPTY_AREAS: SearchAreaItem[] = []

export function SearchAreaRecommendationSection({
  reportId,
}: SearchAreaRecommendationSectionProps) {
  const recommendMutation = useSearchAreaRecommendationMutation()
  const recommendation = recommendMutation.data
  const { addressesByRank } = useReverseGeocodedAddresses(recommendation?.areas ?? EMPTY_AREAS)
  const errorMessage =
    recommendMutation.error instanceof SearchAreaRecommendationError
      ? recommendMutation.error.message
      : recommendMutation.isError
        ? '수색 영역을 불러오지 못했어요.'
        : null

  return (
    <section
      aria-labelledby="search-area-recommendation-title"
      className="search-area-recommendation-section"
    >
      <h2 id="search-area-recommendation-title">AI 추천 수색 영역</h2>
      <p className="search-area-recommendation-section__description">
        신고하신 위치·시간과 아이의 행동 특징을 바탕으로, 지금 먼저 확인해보면 좋을 곳을 AI가 추천해
        드려요.
      </p>

      {!recommendation && (
        <button
          className="search-area-recommendation-section__cta"
          disabled={recommendMutation.isPending}
          onClick={() => recommendMutation.mutate(reportId)}
          type="button"
        >
          {recommendMutation.isPending ? '수색 지역을 계산하는 중이에요...' : '수색 지역 추천받기'}
        </button>
      )}

      {errorMessage && (
        <div className="search-area-recommendation-section__error" role="alert">
          <p>{errorMessage}</p>
          <button onClick={() => recommendMutation.mutate(reportId)} type="button">
            다시 시도
          </button>
        </div>
      )}

      {recommendation && (
        <div className="search-area-recommendation-section__result">
          {recommendation.fallbackUsed && (
            <p className="search-area-recommendation-section__fallback-notice" role="status">
              일부 지역 정보를 불러오지 못해 대체값으로 계산됐어요. 실제 지형과 다를 수 있어요.
            </p>
          )}

          <SearchAreaRecommendationMap areas={recommendation.areas} />

          <ol className="search-area-recommendation-section__list">
            {recommendation.areas.map((area) => (
              <li key={area.rank}>
                <span
                  aria-hidden="true"
                  className="search-area-recommendation-section__dot"
                  style={{ backgroundColor: priorityColorForRank(area.rank) }}
                />
                <div>
                  <strong>
                    {area.rank}순위
                    {addressesByRank[area.rank] === undefined
                      ? ' · 주소 확인 중...'
                      : addressesByRank[area.rank]
                        ? ` · ${addressesByRank[area.rank]}`
                        : ''}
                  </strong>
                  <p>
                    {area.reason?.trim() || '이 지역을 우선적으로 확인해보세요.'} (반경{' '}
                    {Math.round(area.radiusMeters)}m)
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <button
            className="search-area-recommendation-section__retry"
            disabled={recommendMutation.isPending}
            onClick={() => recommendMutation.mutate(reportId)}
            type="button"
          >
            {recommendMutation.isPending ? '다시 계산하는 중이에요...' : '다시 추천받기'}
          </button>
        </div>
      )}
    </section>
  )
}

export type { SearchAreaRecommendationSectionProps }
