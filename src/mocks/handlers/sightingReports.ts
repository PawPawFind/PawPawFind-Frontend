import { delay, http, HttpResponse } from 'msw'
import {
  REPORT_FEATURES_API_PATH,
  REPORT_PHOTOS_API_PATH,
  PRESIGN_UPLOAD_API_PATH,
  SIGHTING_REPORTS_API_PATH,
} from '@/features/sighting-reports/api/sightingReports.api'
import {
  createSightingReportsPage,
  sightingReportApiItems,
  sightingReportFeaturesFixture,
  sightingReportPhotosFixture,
} from '@/mocks/fixtures/sightingReports'

export const sightingReportsHandlers = [
  http.put(
    'https://mock-upload.pawpawfind.test/:filename',
    () => new HttpResponse(null, { status: 200 }),
  ),
  http.post(`*${PRESIGN_UPLOAD_API_PATH}`, async ({ request }) => {
    const body = (await request.json()) as { filename: string }
    return HttpResponse.json({
      uploadUrl: `https://mock-upload.pawpawfind.test/${encodeURIComponent(body.filename)}`,
      photoUrl: `https://mock-cdn.pawpawfind.test/${encodeURIComponent(body.filename)}`,
      objectKey: `reports/${body.filename}`,
    })
  }),
  http.post(`*${REPORT_PHOTOS_API_PATH}`, () =>
    HttpResponse.json({ id: 101, createdAt: new Date().toISOString() }),
  ),
  http.post(`*${REPORT_FEATURES_API_PATH}`, () => HttpResponse.json({ id: 201 })),
  http.post(`*${SIGHTING_REPORTS_API_PATH}`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    if (body.reportType === 'LOST' && body.species !== '강아지' && body.species !== '고양이') {
      return HttpResponse.json({ message: '실종 제보 동물 종류 형식 오류' }, { status: 400 })
    }
    return HttpResponse.json({
      ...body,
      reportId: 101,
      userId: 100,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }),
  http.get(`*${REPORT_PHOTOS_API_PATH}`, async ({ request }) => {
    await delay(100)
    const reportId = new URL(request.url).searchParams.get('reportId') ?? ''
    return HttpResponse.json(sightingReportPhotosFixture[reportId] ?? [])
  }),
  http.get(`*${REPORT_FEATURES_API_PATH}`, async ({ request }) => {
    await delay(100)
    const reportId = new URL(request.url).searchParams.get('reportId') ?? ''
    return HttpResponse.json(sightingReportFeaturesFixture[reportId] ?? [])
  }),
  http.get(`*${SIGHTING_REPORTS_API_PATH}/me`, async ({ request }) => {
    await delay(100)
    if (!request.headers.get('Authorization')) {
      return HttpResponse.json({ message: '인증이 필요합니다.' }, { status: 401 })
    }
    return HttpResponse.json(createSightingReportsPage(0, 2))
  }),
  http.delete(`*${SIGHTING_REPORTS_API_PATH}/:reportId`, ({ request }) => {
    if (!request.headers.get('Authorization')) {
      return HttpResponse.json({ message: '인증이 필요합니다.' }, { status: 401 })
    }
    return new HttpResponse(null, { status: 200 })
  }),
  http.get(`*${SIGHTING_REPORTS_API_PATH}/:sightingId`, async ({ params }) => {
    await delay(100)
    const report = sightingReportApiItems.find(
      (item) => item.reportId === Number(params.sightingId),
    )
    return report
      ? HttpResponse.json(report)
      : HttpResponse.json({ message: '목격 제보를 찾을 수 없습니다.' }, { status: 404 })
  }),
  http.get(`*${SIGHTING_REPORTS_API_PATH}`, async ({ request }) => {
    await delay(100)
    const url = new URL(request.url)
    const page = Math.max(0, Number(url.searchParams.get('page') ?? 0))
    const size = Math.max(1, Number(url.searchParams.get('size') ?? 20))
    const reportType = url.searchParams.get('reportType')

    if (reportType && reportType !== 'FOUND')
      return HttpResponse.json(createSightingReportsPage(0, size))
    return HttpResponse.json(createSightingReportsPage(page, size))
  }),
]
