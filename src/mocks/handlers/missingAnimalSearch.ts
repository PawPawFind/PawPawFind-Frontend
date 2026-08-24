import { http, HttpResponse } from 'msw'
import sampleDogImage from '@/assets/sighting-report-mocks/sample-dog.png'
import { sightingReportApiItems } from '../fixtures/sightingReports'

const mockMatchResponse = {
  matchRunId: 501,
  reportId: 101,
  modelVersion: 'mock-v1',
  rerankVersion: null,
  decision: 'MATCHED',
  status: 'DONE',
  createdAt: '2026-08-25T12:00:00',
  results: [
    {
      rank: 1,
      candidateType: 'SHELTER',
      desertionNo: '411314202600123',
      candidateReportId: null,
      visualScore: 0.92,
      rankingScore: 0.92,
      tagScore: 0.8,
      textScore: 0.7,
      phashDistance: null,
      nearDuplicate: false,
      matchedTags: {},
      conflictingTags: {},
      galleryId: 'animal-1',
      imageUrl: sampleDogImage,
    },
    {
      rank: 2,
      candidateType: 'REPORT',
      desertionNo: null,
      candidateReportId: 1,
      visualScore: 0.84,
      rankingScore: 0.84,
      tagScore: 0.7,
      textScore: 0.6,
      phashDistance: null,
      nearDuplicate: false,
      matchedTags: {},
      conflictingTags: {},
      galleryId: 'report-1',
      imageUrl: sampleDogImage,
    },
  ],
}

export const missingAnimalSearchHandlers = [
  http.post('*/api/reports/:reportId/run-match', () => HttpResponse.json(mockMatchResponse)),
  http.get('*/api/reports/:reportId/matches', ({ request, params }) =>
    HttpResponse.json({
      ...mockMatchResponse,
      reportId: Number(params.reportId),
      results:
        params.reportId === 'empty' || new URL(request.url).searchParams.get('limit') === '0'
          ? []
          : mockMatchResponse.results,
    }),
  ),
  http.get('*/api/animals/:desertionNo', ({ params }) =>
    HttpResponse.json({
      desertionNo: params.desertionNo,
      happenDt: '20260808',
      happenPlace: '서울 강서구 화곡동',
      upKindCd: '417000',
      upKindNm: '개',
      kindCd: '000114',
      kindNm: '믹스견',
      kindFullNm: '[개] 믹스견',
      colorCd: '흰색',
      age: '2024(년생)',
      weight: '4.2(Kg)',
      noticeNo: '서울-강서-2026-00842',
      noticeSdt: '20260808',
      noticeEdt: '20260818',
      popfile1: sampleDogImage,
      popfile2: null,
      processState: '보호중',
      sexCd: 'M',
      neuterYn: 'Y',
      specialMark: '사람을 잘 따름',
      careRegNo: '311500202600001',
      careNm: '강서구동물보호센터',
      careTel: '02-1234-5678',
      careAddr: '서울 강서구',
      orgNm: '서울특별시 강서구',
      sourceUpdTm: '20260808120000',
      updatedAt: '2026-08-08T12:00:00',
      createdAt: '2026-08-08T12:00:00',
    }),
  ),
  http.get('*/api/reports/1', () => HttpResponse.json(sightingReportApiItems[0])),
]
