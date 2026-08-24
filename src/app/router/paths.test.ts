import { describe, expect, it } from 'vitest'
import { ROUTE_PATHS, routeUrls } from './paths'

describe('routeUrls', () => {
  it('입력 폼 URL을 생성한다', () => {
    expect(routeUrls.kakaoAuthCallback()).toBe('/auth/kakao/callback')
    expect(routeUrls.sightingReportForm()).toBe('/sightings/new')
    expect(routeUrls.missingAnimalSearch()).toBe('/find/new')
    expect(routeUrls.missingAnimalSearchForm()).toBe('/find/new')
  })

  it('동적 segment를 URL에 안전하게 넣는다', () => {
    expect(ROUTE_PATHS.SIGHTING_REPORT_DETAIL).toBe('/sightings/:sightingId')
    expect(ROUTE_PATHS.LOST_REPORT_DETAIL).toBe('/lost-reports/:reportId')
    expect(routeUrls.sightingReportDetail('report/한글')).toBe(
      '/sightings/report%2F%ED%95%9C%EA%B8%80',
    )
    expect(routeUrls.lostReportDetail('report/한글')).toBe(
      '/lost-reports/report%2F%ED%95%9C%EA%B8%80',
    )
    expect(routeUrls.missingAnimalSearchResult('search 1')).toBe('/find/results/search%201')
    expect(routeUrls.shelterNoticeDetail('notice/한글')).toBe(
      '/shelter-notices/notice%2F%ED%95%9C%EA%B8%80',
    )
  })
})
