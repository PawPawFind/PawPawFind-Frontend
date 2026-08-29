import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { server } from '@/mocks/server'
import {
  createSightingReport,
  getSightingReport,
  PRESIGN_UPLOAD_API_PATH,
  REPORT_FEATURES_API_PATH,
  REPORT_PHOTOS_API_PATH,
  SIGHTING_REPORTS_API_PATH,
  toSightingReportListItem,
} from './sightingReports.api'

describe('sightingReports API mapper', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('백엔드의 한글 값과 nullable 필드를 포함한 제보를 목록 모델로 변환한다', () => {
    expect(
      toSightingReportListItem({
        reportId: 17,
        thumbnailUrl: 'https://cdn.example.com/reports/17-thumbnail.jpg',
        userId: null,
        reportType: 'FOUND',
        title: '서울에서 발견한 강아지',
        species: '강아지',
        size: '중형',
        eventDate: '2026-08-24',
        eventHour: null,
        happenPlace: '서울',
        latitude: 37.5665,
        longitude: 126.978,
        description: null,
        status: 'OPEN',
        createdAt: '2026-08-23T18:00:18.849331',
        updatedAt: '2026-08-23T18:00:18.849331',
      }),
    ).toEqual({
      id: '17',
      title: '서울에서 발견한 강아지',
      speciesLabel: '강아지',
      colorText: '',
      sizeLabel: '중형',
      areaText: '서울',
      dateText: '2026.08.24',
      thumbnailUrl: 'https://cdn.example.com/reports/17-thumbnail.jpg',
    })
  })

  it('상세 응답의 모든 특징을 API 카테고리별로 묶어 전달한다', async () => {
    const report = await getSightingReport('1')

    expect(report.features).toEqual([
      { category: '털색', keywords: ['갈색', '흰색'] },
      { category: '털길이', keywords: ['중간'] },
      { category: '착용 중', keywords: ['목줄 없음'] },
      { category: '행동', keywords: ['겁이 많음'] },
      { category: '귀', keywords: ['접힌 귀'] },
      { category: '꼬리', keywords: ['말림'] },
      { category: '눈/얼굴', keywords: ['눈 색 다름'] },
      { category: '몸 상태', keywords: ['다리 절뚝임'] },
    ])
  })

  it('제보를 만든 뒤 사진을 업로드하고 사진·특징을 생성한다', async () => {
    const requests: { path: string; body: unknown }[] = []
    const photo = new File(['photo-content'], 'dog.jpg', { type: 'image/jpeg' })
    const uploadFetch = vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
    vi.stubGlobal('fetch', uploadFetch)

    server.use(
      http.post(`*${SIGHTING_REPORTS_API_PATH}`, async ({ request }) => {
        requests.push({ path: 'report', body: await request.json() })
        return HttpResponse.json({ reportId: 37 })
      }),
      http.post(`*${PRESIGN_UPLOAD_API_PATH}`, async ({ request }) => {
        requests.push({ path: 'presign', body: await request.json() })
        return HttpResponse.json({
          uploadUrl: 'https://uploads.test/dog.jpg',
          photoUrl: 'https://cdn.test/dog.jpg',
          objectKey: 'reports/dog.jpg',
        })
      }),
      http.post(`*${REPORT_PHOTOS_API_PATH}`, async ({ request }) => {
        requests.push({ path: 'photo', body: await request.json() })
        return HttpResponse.json({ id: 1 })
      }),
      http.post(`*${REPORT_FEATURES_API_PATH}`, async ({ request }) => {
        requests.push({ path: 'feature', body: await request.json() })
        return HttpResponse.json({ id: 1 })
      }),
    )

    await expect(
      createSightingReport({
        report: {
          reportType: 'FOUND',
          title: '연남동 목격 제보',
          species: 'DOG',
          size: 'MEDIUM',
          eventDate: '2026-08-25',
          eventHour: 15,
          happenPlace: '서울 마포구 연남동',
          latitude: 37.5665,
          longitude: 126.978,
        },
        photos: [{ file: photo, sortOrder: 1 }],
        features: [{ category: '털색', keyword: '갈색' }],
      }),
    ).resolves.toEqual({ reportId: 37 })

    expect(requests).toEqual(
      expect.arrayContaining([
        {
          path: 'report',
          body: {
            reportType: 'FOUND',
            title: '연남동 목격 제보',
            species: 'DOG',
            size: 'MEDIUM',
            eventDate: '2026-08-25',
            eventHour: 15,
            happenPlace: '서울 마포구 연남동',
            latitude: 37.5665,
            longitude: 126.978,
          },
        },
        {
          path: 'presign',
          body: { filename: 'dog.jpg', contentType: 'image/jpeg' },
        },
        {
          path: 'photo',
          body: { reportId: 37, photoUrl: 'https://cdn.test/dog.jpg', sortOrder: 1 },
        },
        {
          path: 'feature',
          body: { reportId: 37, category: '털색', keyword: '갈색' },
        },
      ]),
    )
    expect(uploadFetch).toHaveBeenCalledWith('https://uploads.test/dog.jpg', {
      method: 'PUT',
      headers: { 'Content-Type': 'image/jpeg' },
      body: photo,
    })
  })

  it('사진 URL 발급이 실패하면 등록 실패를 전달한다', async () => {
    const deletedReportIds: string[] = []

    server.use(
      http.post(`*${SIGHTING_REPORTS_API_PATH}`, () => HttpResponse.json({ reportId: 38 })),
      http.post(`*${PRESIGN_UPLOAD_API_PATH}`, () =>
        HttpResponse.json({ message: '업로드 URL 발급 실패' }, { status: 500 }),
      ),
      http.delete(`*${SIGHTING_REPORTS_API_PATH}/:reportId`, ({ params }) => {
        deletedReportIds.push(String(params.reportId))
        return new HttpResponse(null, { status: 200 })
      }),
    )

    await expect(
      createSightingReport({
        report: {
          reportType: 'FOUND',
          title: '실패 제보',
          species: 'DOG',
          size: 'SMALL',
          eventDate: '2026-08-25',
          eventHour: null,
          happenPlace: '서울',
          latitude: 37.5,
          longitude: 127,
        },
        photos: [{ file: new File(['photo'], 'dog.jpg', { type: 'image/jpeg' }), sortOrder: 1 }],
        features: [],
      }),
    ).rejects.toMatchObject({
      name: 'ReportAssetCreationError',
      reportId: 38,
      cleanupFailed: false,
    })
    expect(deletedReportIds).toEqual(['38'])
  })

  it('사진 등록과 생성된 제보 정리가 모두 실패하면 reportId를 포함한 오류를 전달한다', async () => {
    server.use(
      http.post(`*${SIGHTING_REPORTS_API_PATH}`, () => HttpResponse.json({ reportId: 39 })),
      http.post(`*${PRESIGN_UPLOAD_API_PATH}`, () =>
        HttpResponse.json({ message: '업로드 URL 발급 실패' }, { status: 500 }),
      ),
      http.delete(`*${SIGHTING_REPORTS_API_PATH}/:reportId`, () =>
        HttpResponse.json({ message: '제보 정리 실패' }, { status: 500 }),
      ),
    )

    await expect(
      createSightingReport({
        report: {
          reportType: 'FOUND',
          title: '정리 실패 제보',
          species: 'DOG',
          size: 'SMALL',
          eventDate: '2026-08-25',
          eventHour: null,
          happenPlace: '서울',
          latitude: 37.5,
          longitude: 127,
        },
        photos: [{ file: new File(['photo'], 'dog.jpg', { type: 'image/jpeg' }), sortOrder: 1 }],
        features: [],
      }),
    ).rejects.toMatchObject({
      name: 'ReportAssetCreationError',
      reportId: 39,
      cleanupFailed: true,
    })
  })
})
