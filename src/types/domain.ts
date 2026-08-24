/**
 * PawPawFind 화면별 데이터 요구사항 v0.1 기준 공용 도메인 타입.
 * https://claude.ai/design/p/6c5747a2-9eae-4016-a2e5-b6a049902736
 */

export type Species = 'DOG' | 'CAT'
export type AnimalSize = 'SMALL' | 'MEDIUM' | 'LARGE'
/** 보호소 공고에만 존재 */
export type Sex = 'MALE' | 'FEMALE' | 'UNKNOWN'

export interface CodedLabel {
  code: string
  label: string
}

export interface AnimalBasic {
  species: Species
  size: AnimalSize
  colors: CodedLabel[]
  sex?: Sex
}

/** coatLength·ears·tail은 단일값, 나머지는 복수값 */
export interface Features {
  coatLength: CodedLabel | null
  ears: CodedLabel | null
  tail: CodedLabel | null
  faceEyes: CodedLabel[]
  wearing: CodedLabel[]
  bodyCondition: CodedLabel[]
  behavior: CodedLabel[]
}

/** 원본 좌표는 응답에 포함하지 않는다 */
export interface PlaceMasked {
  areaText: string
  circle: {
    lat: number
    lng: number
    radiusM: number
  }
}

export interface Photo {
  id: string
  url: string
  thumbnailUrl: string
  order: number
  slotLabel?: string
}

/** 날짜 포맷은 서버가 완료해서 내려준다 — 프론트에서 가공하지 않는다 */
export interface DateText {
  dateText: string
  timeBandText?: string
  /** 정렬용 ISO 문자열 */
  dateTime: string
}

export interface Page {
  number: number
  size: number
  totalCount: number
}

export interface ListResponse<T> {
  items: T[]
  page: Page
}

export type SelectionType = 'SINGLE' | 'MULTI'

export interface FilterGroup {
  key: string
  label: string
  selectionType: SelectionType
  options: CodedLabel[]
}

export type RefType = 'SHELTER' | 'SIGHTING'
export type SimilarityBand = 'HIGH' | 'MEDIUM' | 'LOW'

export interface Candidate {
  refType: RefType
  refId: string
  thumbnailUrl: string
  title: string
  areaText: string
  distanceText?: string
  dateText: string
  similarityScore: number
  similarityBand: SimilarityBand
  statusLabel?: string
}
