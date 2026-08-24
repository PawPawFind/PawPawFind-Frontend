import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router'
import { server } from '@/mocks/server'
import { sightingReportsFixture } from '@/mocks/fixtures/sightingReports'
import { renderWithQueryClient } from '@/test/render'
import * as sightingReportsApi from '../api/sightingReports.api'
import { SightingReportListPage } from './SightingReportListPage'

const { SIGHTING_REPORTS_API_PATH } = sightingReportsApi
const renderPage = () =>
  renderWithQueryClient(
    <MemoryRouter initialEntries={['/sightings']}>
      <SightingReportListPage />
    </MemoryRouter>,
  )

describe('SightingReportListPage', () => {
  it('요청 중에는 로딩 상태를 보여준다', () => {
    renderPage()

    expect(screen.getByRole('status')).toHaveTextContent('목격 제보를 불러오는 중입니다.')
    expect(screen.getByRole('link', { name: '목격 제보 작성하기' })).toHaveAttribute(
      'href',
      '/sightings/new',
    )
  })

  it('목격 제보 목록을 보여준다', async () => {
    let requestedUrl = ''
    server.use(
      http.get(`*${SIGHTING_REPORTS_API_PATH}`, ({ request }) => {
        requestedUrl = request.url
        return HttpResponse.json(sightingReportsFixture)
      }),
    )
    renderPage()

    expect(
      await screen.findByRole('heading', {
        name: '연남동 골목에서 갈색 중형견 봤어요',
      }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('2026.08.23').length).toBeGreaterThan(0)
    expect(document.querySelectorAll('.sighting-report-list-item__thumbnail img')).toHaveLength(10)
    expect(screen.queryByText(/14–16시/)).not.toBeInTheDocument()
    const searchParams = new URL(requestedUrl).searchParams
    expect(searchParams.get('page')).toBe('0')
    expect(searchParams.get('size')).toBe('10')
    expect(searchParams.get('reportType')).toBe('FOUND')
  })

  it('페이지를 선택하면 해당 서버 페이지를 요청한다', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByRole('heading', { name: '연남동 골목에서 갈색 중형견 봤어요' })
    await user.click(screen.getByRole('button', { name: '2페이지' }))

    expect(
      await screen.findByRole('heading', { name: '북가좌동 하천 주변 흰 고양이' }),
    ).toBeInTheDocument()
    expect(screen.getByText('전체 15건 · 11–15')).toBeInTheDocument()
  })

  it('필터 그룹을 펼쳐 선택하고 선택 개수와 요약을 표시한다', async () => {
    const user = userEvent.setup()
    renderPage()

    const filterButton = screen.getByRole('button', { name: '필터' })
    expect(filterButton).not.toHaveClass('report-list-page__filter-trigger--active')
    await user.click(filterButton)
    expect(filterButton).toHaveClass('report-list-page__filter-trigger--active')
    await user.click(screen.getByRole('button', { name: '동물 종류' }))
    await user.click(screen.getByRole('button', { name: '강아지' }))

    expect(screen.getByRole('button', { name: '필터 1' })).toHaveClass(
      'report-list-page__filter-trigger--active',
    )
    expect(screen.getByRole('button', { name: /동물 종류.*강아지/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '강아지 필터 제거' })).toBeInTheDocument()
  })

  it('목격 제보가 없으면 빈 목록 안내를 보여준다', async () => {
    server.use(
      http.get(`*${SIGHTING_REPORTS_API_PATH}`, () =>
        HttpResponse.json({
          ...sightingReportsFixture,
          totalPages: 0,
          totalElements: 0,
          content: [],
          numberOfElements: 0,
          empty: true,
        }),
      ),
    )

    renderPage()

    expect(await screen.findByText('등록된 목격 제보가 없습니다.')).toBeInTheDocument()
  })

  it('API 요청이 실패하면 오류를 보여주고 다시 시도할 수 있다', async () => {
    let requestCount = 0

    server.use(
      http.get(`*${SIGHTING_REPORTS_API_PATH}`, () => {
        requestCount += 1

        return requestCount === 1
          ? new HttpResponse(null, { status: 500 })
          : HttpResponse.json(sightingReportsFixture)
      }),
    )

    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('목격 제보를 불러오지 못했습니다.')

    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(
      await screen.findByRole('heading', {
        name: '연남동 골목에서 갈색 중형견 봤어요',
      }),
    ).toBeInTheDocument()
  })
})
