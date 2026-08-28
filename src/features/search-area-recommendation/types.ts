// 백엔드 dto 파일(SearchAreaResponse.java / SearchAreaItemResponse.java /
// SearchAreaCenterResponse.java, PawPawFind-Backend develop 브랜치 기준)과
// 필드명을 1:1로 맞춘 타입입니다. 백엔드 구조가 바뀌면 이 파일만 고치면 됩니다.

export interface SearchAreaCenter {
  latitude: number
  longitude: number
}

export interface SearchAreaItem {
  rank: number
  center: SearchAreaCenter
  radiusMeters: number
  /** 발견 "확률"이 아니라 수색 "우선점수". 화면에 확률로 표기하면 안 됨. */
  priorityScore: number
  reasonCodes: string[] | null
  /** 사람이 읽을 수 있는 설명 문구. 있으면 이걸 그대로 보여주면 됨. */
  reason: string | null
}

export interface SearchAreaRecommendation {
  reportId: number
  algorithmVersion: string | null
  behaviorType: string | null
  estimatedRadiusMeters: number | null
  environmentSource: string | null
  /** true여도 정상 응답 — 에러 아님. AI가 Overpass 조회에 실패해 대체값을 썼다는 뜻. */
  fallbackUsed: boolean
  assumptions: string[] | null
  areas: SearchAreaItem[]
}

export type SearchAreaErrorCode =
  | 'UNAUTHORIZED' // 401
  | 'FORBIDDEN' // 403
  | 'NOT_FOUND' // 404
  | 'UNSUPPORTED_REPORT' // 422
  | 'AI_UNAVAILABLE' // 503
  | 'AI_ERROR' // 502
  | 'UNKNOWN'
