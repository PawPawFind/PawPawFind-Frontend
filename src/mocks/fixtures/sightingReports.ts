import type {
  ReportFeatureApiItem,
  ReportListApiItem,
  ReportListApiResponse,
  ReportPhotoApiItem,
} from '@/features/sighting-reports/types'
import sampleCatImage from '@/assets/sighting-report-mocks/sample-cat.png'
import sampleDogImage from '@/assets/sighting-report-mocks/sample-dog.png'

const reportSeeds = [
  ['연남동 골목에서 갈색 중형견 봤어요', 'DOG', 'MEDIUM', '서울 마포구 연남동', 15],
  ['서교동 편의점 앞 흰 소형견', 'DOG', 'SMALL', '서울 마포구 서교동', 19],
  ['망원동 주차장 삼색 고양이', 'CAT', 'SMALL', '서울 마포구 망원동', 13],
  ['합정동 카페 앞 크림색 소형견', 'DOG', 'SMALL', '서울 마포구 합정동', 17],
  ['성산동 공원에서 검은 고양이를 봤어요', 'CAT', 'MEDIUM', '서울 마포구 성산동', 11],
  ['상암동 산책로를 배회하던 대형견', 'DOG', 'LARGE', '서울 마포구 상암동', 9],
  ['동교동역 근처 치즈 고양이', 'CAT', 'SMALL', '서울 마포구 동교동', 21],
  ['아현동 골목의 회색 중형견', 'DOG', 'MEDIUM', '서울 마포구 아현동', 7],
  ['신촌역 앞 목줄 없는 소형견', 'DOG', 'SMALL', '서울 서대문구 신촌동', 23],
  ['연희동 주택가에서 고양이 목격', 'CAT', 'MEDIUM', '서울 서대문구 연희동', 15],
  ['북가좌동 하천 주변 흰 고양이', 'CAT', 'SMALL', '서울 서대문구 북가좌동', 13],
  ['홍제동 놀이터 근처 갈색 강아지', 'DOG', 'SMALL', '서울 서대문구 홍제동', 17],
  ['응암동 시장 입구 대형견', 'DOG', 'LARGE', '서울 은평구 응암동', 19],
  ['증산동 골목에서 검은 고양이 발견', 'CAT', 'MEDIUM', '서울 은평구 증산동', 11],
  ['수색동 공원 벤치 주변 소형견', 'DOG', 'SMALL', '서울 은평구 수색동', 9],
] as const

export const sightingReportApiItems: ReportListApiItem[] = reportSeeds.map(
  ([title, species, size, happenPlace, eventHour], index) => {
    const day = String(23 - Math.floor(index / 2)).padStart(2, '0')
    return {
      reportId: index + 1,
      thumbnailUrl: species === 'DOG' ? sampleDogImage : sampleCatImage,
      userId: 100 + index,
      reportType: 'FOUND',
      title,
      species,
      size,
      eventDate: `2026-08-${day}`,
      eventHour,
      happenPlace,
      latitude: 37.56 + index * 0.001,
      longitude: 126.92 + index * 0.001,
      description: '이용자가 등록한 목격 제보입니다.',
      status: 'OPEN',
      createdAt: `2026-08-${day}T12:00:00.000Z`,
      updatedAt: `2026-08-${day}T12:00:00.000Z`,
    }
  },
)

const pageSort = { empty: true, sorted: false, unsorted: true }

export function createSightingReportsPage(page: number, size: number): ReportListApiResponse {
  const start = page * size
  const content = sightingReportApiItems.slice(start, start + size)
  const totalPages = Math.ceil(sightingReportApiItems.length / size)

  return {
    totalPages,
    totalElements: sightingReportApiItems.length,
    size,
    content,
    number: page,
    sort: pageSort,
    pageable: {
      offset: start,
      sort: pageSort,
      paged: true,
      pageNumber: page,
      pageSize: size,
      unpaged: false,
    },
    numberOfElements: content.length,
    first: page === 0,
    last: page >= totalPages - 1,
    empty: content.length === 0,
  }
}

export const sightingReportsFixture = createSightingReportsPage(0, 10)

export const sightingReportPhotosFixture: Record<string, ReportPhotoApiItem[]> = {
  '1': [
    {
      id: 1,
      reportId: 1,
      photoUrl: sampleDogImage,
      createdAt: '2026-08-23T12:00:00.000Z',
      updatedAt: '2026-08-23T12:00:00.000Z',
      sortOrder: 1,
    },
    {
      id: 2,
      reportId: 1,
      photoUrl: sampleCatImage,
      createdAt: '2026-08-23T12:00:00.000Z',
      updatedAt: '2026-08-23T12:00:00.000Z',
      sortOrder: 2,
    },
  ],
}

export const sightingReportFeaturesFixture: Record<string, ReportFeatureApiItem[]> = {
  '1': [
    { id: 1, reportId: 1, category: '털색', keyword: '갈색' },
    { id: 2, reportId: 1, category: '털색', keyword: '흰색' },
    { id: 3, reportId: 1, category: '털길이', keyword: '중간' },
    { id: 4, reportId: 1, category: '착용 중', keyword: '목줄 없음' },
    { id: 5, reportId: 1, category: '행동', keyword: '겁이 많음' },
    { id: 6, reportId: 1, category: '귀', keyword: '접힌 귀' },
    { id: 7, reportId: 1, category: '꼬리', keyword: '말림' },
    { id: 8, reportId: 1, category: '눈/얼굴', keyword: '눈 색 다름' },
    { id: 9, reportId: 1, category: '몸 상태', keyword: '다리 절뚝임' },
  ],
}
