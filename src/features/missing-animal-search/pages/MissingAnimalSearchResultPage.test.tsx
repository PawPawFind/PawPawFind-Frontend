import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { server } from '@/mocks/server'
import { sightingReportApiItems } from '@/mocks/fixtures/sightingReports'
import { renderWithQueryClient } from '@/test/render'
import { MissingAnimalSearchResultPage } from './MissingAnimalSearchResultPage'

function renderPage() {
  return renderWithQueryClient(
    <MemoryRouter initialEntries={['/find/results/101']}>
      <Routes>
        <Route element={<MissingAnimalSearchResultPage />} path="/find/results/:searchId" />
      </Routes>
    </MemoryRouter>,
  )
}

describe('MissingAnimalSearchResultPage', () => {
  it('매칭 후보의 보호소·목격 제보 상세를 보강해 표시한다', async () => {
    renderPage()

    expect(screen.getByRole('status')).toHaveTextContent('검색 결과를 불러오는 중입니다.')
    expect(await screen.findByRole('heading', { name: '강아지 · 믹스견 · 흰색' })).toBeVisible()
    expect(screen.getByRole('heading', { name: /연남동 골목/ })).toBeVisible()
    expect(
      screen.getByRole('link', { name: /강아지 · 믹스견 · 흰색 후보 상세 보기/ }),
    ).toHaveAttribute('href', '/shelter-notices/411314202600123')
    expect(screen.getByText('유사도 92점')).toBeVisible()
  })

  it('매칭 후보가 없으면 빈 결과를 표시한다', async () => {
    server.use(
      http.get('*/api/reports/:reportId/matches', ({ params }) =>
        HttpResponse.json({ reportId: Number(params.reportId), results: [] }),
      ),
    )
    renderPage()

    expect(
      await screen.findByRole('heading', { name: '아직 비슷한 동물을 찾지 못했어요' }),
    ).toBeVisible()
  })

  it('제목이 없는 LOST 후보를 동물 정보와 실종 동물 출처로 구분한다', async () => {
    server.use(
      http.get('*/api/reports/:reportId/matches', ({ params }) =>
        HttpResponse.json({
          reportId: Number(params.reportId),
          results: [
            {
              rank: 1,
              candidateType: 'REPORT',
              desertionNo: null,
              candidateReportId: 45,
              visualScore: 0.88,
              rankingScore: 0.9,
              imageUrl: '/lost-dog.jpg',
            },
          ],
        }),
      ),
      http.get('*/api/reports/45', () =>
        HttpResponse.json({
          ...sightingReportApiItems[0],
          reportId: 45,
          reportType: 'LOST',
          title: null,
          species: '강아지',
          size: '소형',
        }),
      ),
    )
    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByRole('heading', { name: '강아지 · 소형' })).toBeVisible()
    expect(screen.getByText('등록된 실종 동물')).toBeVisible()
    expect(screen.getByRole('link', { name: /강아지 · 소형 후보 상세 보기/ })).toHaveAttribute(
      'href',
      '/lost-reports/45',
    )
    await user.click(screen.getByRole('button', { name: '실종 동물' }))
    expect(screen.getByRole('article')).toBeVisible()
  })

  it('결과 조회 실패 후 다시 시도할 수 있다', async () => {
    let requestCount = 0
    server.use(
      http.get('*/api/reports/:reportId/matches', ({ params }) => {
        requestCount += 1
        return requestCount === 1
          ? HttpResponse.json({ message: '실패' }, { status: 500 })
          : HttpResponse.json({ reportId: Number(params.reportId), results: [] })
      }),
    )
    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('검색 결과를 불러오지 못했어요')
    await user.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(
      await screen.findByRole('heading', { name: '아직 비슷한 동물을 찾지 못했어요' }),
    ).toBeVisible()
  })
})
