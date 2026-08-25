import axios from 'axios'
import { apiClient } from '@/api/client'
import type { SearchAreaErrorCode, SearchAreaRecommendation } from '../types'

const REPORTS_API_PATH = '/api/reports'

function searchAreasApiPath(reportId: string | number) {
  return `${REPORTS_API_PATH}/${encodeURIComponent(String(reportId))}/search-areas`
}

export class SearchAreaRecommendationError extends Error {
  code: SearchAreaErrorCode

  constructor(code: SearchAreaErrorCode, message: string) {
    super(message)
    this.name = 'SearchAreaRecommendationError'
    this.code = code
  }
}

// 백엔드 docs/search-area-api.md의 오류 응답 표(401/403/404/422/503/502)를
// 그대로 한글 메시지로 매핑. 프론트 문서(search-area-recommendation-api.md)에서
// 결정한 대로 상태 코드별로 다른 문구를 보여준다.
function toSearchAreaError(error: unknown): SearchAreaRecommendationError {
  if (axios.isAxiosError(error)) {
    switch (error.response?.status) {
      case 401:
        return new SearchAreaRecommendationError('UNAUTHORIZED', '로그인이 필요해요.')
      case 403:
        return new SearchAreaRecommendationError(
          'FORBIDDEN',
          '본인이 등록한 신고만 수색 영역을 추천받을 수 있어요.',
        )
      case 404:
        return new SearchAreaRecommendationError('NOT_FOUND', '신고 정보를 찾을 수 없어요.')
      case 422:
        return new SearchAreaRecommendationError(
          'UNSUPPORTED_REPORT',
          '수색 영역 추천은 강아지 실종 신고에서만 지원돼요.',
        )
      case 503:
        return new SearchAreaRecommendationError(
          'AI_UNAVAILABLE',
          'AI 서버 연결에 실패했어요. 잠시 후 다시 시도해 주세요.',
        )
      case 502:
        return new SearchAreaRecommendationError(
          'AI_ERROR',
          'AI 응답을 처리하는 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.',
        )
      default:
        break
    }
  }
  return new SearchAreaRecommendationError('UNKNOWN', '수색 영역을 불러오지 못했어요.')
}

// 결과는 DB에 저장되지 않고 요청마다 새로 계산되므로(스펙 문서 명시),
// 이 함수 결과는 절대 캐시하지 않는다 — 호출부는 반드시 useMutation으로 다뤄야 함.
export async function recommendSearchAreas(
  reportId: string | number,
): Promise<SearchAreaRecommendation> {
  try {
    const { data } = await apiClient.post<SearchAreaRecommendation>(
      searchAreasApiPath(reportId),
      undefined, // 요청 body 없음 (reportId만으로 서버가 처리)
    )
    return data
  } catch (error) {
    throw toSearchAreaError(error)
  }
}
