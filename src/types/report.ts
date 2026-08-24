import type { AnimalSize, Species } from './domain'

export type ReportType = 'LOST' | 'FOUND'

export type ReportFeatureCategory =
  '털색' | '털길이' | '귀' | '꼬리' | '눈/얼굴' | '착용 중' | '몸 상태' | '행동'

export interface ReportFeatureInput {
  category: ReportFeatureCategory
  keyword: string
}

export interface ReportPhotoDraft {
  file: File
  sortOrder: number
}

export interface ReportRequestFields {
  species: Species
  size: AnimalSize
  eventDate: string
  eventHour: number | null
  happenPlace: string
  latitude: number
  longitude: number
}

export const DEFAULT_REPORT_LOCATION = {
  happenPlace: '서울특별시 강남구 테헤란로4길 29, 4층(역삼동, 정우씨티)',
  latitude: '37.4965607',
  longitude: '127.0305335',
} as const

export interface CreateSightingReportRequest extends ReportRequestFields {
  reportType: 'FOUND'
  title: string
}

export interface CreateMissingAnimalReportRequest extends ReportRequestFields {
  reportType: 'LOST'
}

export type CreateReportRequest = CreateSightingReportRequest | CreateMissingAnimalReportRequest

export interface CreateReportFeatureRequest extends ReportFeatureInput {
  reportId: number
}

export interface CreateReportPhotoRequest {
  reportId: number
  photoUrl: string
  sortOrder: number
}

export interface PresignUploadRequest {
  filename: string
  contentType: string
}

export interface PresignUploadResponse {
  uploadUrl: string
  photoUrl: string
  objectKey: string
}

interface ReportFeatureGroup {
  category: ReportFeatureCategory
  label: string
  maxSelections: number | null
  selection: 'single' | 'multiple'
  options: readonly ReportFeatureOption[]
  required?: boolean
}

interface ReportFeatureOption {
  label: string
  keyword: string
  swatch?: string
}

// API는 하나의 eventHour를 받으므로 2시간 구간의 중간 시각을 대표값으로 사용한다.
// 빈 값은 시간을 모르는 경우이며 request에서 null로 변환된다.
export const REPORT_TIME_BAND_OPTIONS = [
  { value: '1', label: '00–02시' },
  { value: '3', label: '02–04시' },
  { value: '5', label: '04–06시' },
  { value: '7', label: '06–08시' },
  { value: '9', label: '08–10시' },
  { value: '11', label: '10–12시' },
  { value: '13', label: '12–14시' },
  { value: '15', label: '14–16시' },
  { value: '17', label: '16–18시' },
  { value: '19', label: '18–20시' },
  { value: '21', label: '20–22시' },
  { value: '23', label: '22–24시' },
  { value: '', label: '시간을 잘 모르겠어요' },
] as const

export const REPORT_FEATURE_GROUPS = [
  {
    category: '털색',
    label: '털색',
    maxSelections: 3,
    selection: 'multiple',
    options: [
      { label: '흰색', keyword: '흰색', swatch: '#ffffff' },
      { label: '크림', keyword: '크림', swatch: '#ebdcc0' },
      { label: '갈색', keyword: '갈색', swatch: '#8a5a2b' },
      { label: '회색', keyword: '회색', swatch: '#9a948e' },
      { label: '검정', keyword: '검정', swatch: '#2a2724' },
    ],
    required: true,
  },
  {
    category: '털길이',
    label: '털 길이',
    maxSelections: 1,
    selection: 'single',
    options: [
      { label: '짧음', keyword: '짧음' },
      { label: '중간', keyword: '중간' },
      { label: '김', keyword: '김' },
      { label: '짧게 깎임', keyword: '짧게 깎임' },
      { label: '엉킴', keyword: '엉킴' },
    ],
    required: false,
  },
  {
    category: '귀',
    label: '귀',
    maxSelections: 1,
    selection: 'single',
    options: [
      { label: '쫑긋', keyword: '쫑긋' },
      { label: '접힘', keyword: '접힌 귀' },
      { label: '한쪽만 접힘', keyword: '한쪽만 접힘' },
      { label: '끝 잘림', keyword: '끝 잘림' },
    ],
    required: false,
  },
  {
    category: '꼬리',
    label: '꼬리',
    maxSelections: 1,
    selection: 'single',
    options: [
      { label: '김', keyword: '김' },
      { label: '짧음', keyword: '짧음' },
      { label: '말림', keyword: '말림' },
      { label: '없음', keyword: '없음' },
    ],
    required: false,
  },
  {
    category: '눈/얼굴',
    label: '눈·얼굴',
    maxSelections: null,
    selection: 'multiple',
    options: [
      { label: '눈 색 다름', keyword: '눈 색 다름' },
      { label: '코가 검정', keyword: '코가 검정' },
      { label: '코가 분홍', keyword: '코가 분홍' },
      { label: '주둥이 흰 털', keyword: '주둥이 흰 털' },
    ],
    required: false,
  },
  {
    category: '착용 중',
    label: '착용 중',
    maxSelections: null,
    selection: 'multiple',
    options: [
      { label: '목줄 없음', keyword: '목줄 없음' },
      { label: '목줄 있음', keyword: '목줄 있음' },
      { label: '하네스', keyword: '하네스' },
      { label: '인식표', keyword: '인식표' },
      { label: '옷', keyword: '옷' },
    ],
    required: false,
  },
  {
    category: '몸 상태',
    label: '몸 상태',
    maxSelections: null,
    selection: 'multiple',
    options: [
      { label: '다리 절뚝임', keyword: '다리 절뚝임' },
      { label: '말랐음', keyword: '말랐음' },
      { label: '털 빠짐', keyword: '털 빠짐' },
      { label: '상처 있음', keyword: '상처 있음' },
      { label: '임신·수유 중', keyword: '임신·수유 중' },
    ],
    required: false,
  },
  {
    category: '행동',
    label: '행동',
    maxSelections: null,
    selection: 'multiple',
    options: [
      { label: '사람 잘 따름', keyword: '사람 잘 따름' },
      { label: '경계심 강함', keyword: '경계심 강함' },
      { label: '겁이 많음', keyword: '겁이 많음' },
      { label: '짖음', keyword: '짖음' },
    ],
    required: false,
  },
] as const satisfies readonly ReportFeatureGroup[]
