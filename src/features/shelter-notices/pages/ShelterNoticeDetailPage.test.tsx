import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { server } from '@/mocks/server'
import { renderWithQueryClient } from '@/test/render'
import { ShelterNoticeDetailPage } from './ShelterNoticeDetailPage'

function renderPage(noticeId = '411314202600123') {
  return renderWithQueryClient(
    <MemoryRouter initialEntries={[`/shelter-notices/${noticeId}`]}>
      <Routes>
        <Route element={<ShelterNoticeDetailPage />} path="/shelter-notices/:noticeId" />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ShelterNoticeDetailPage', () => {
  it('보호 ID로 실제 공고와 보호소 정보를 표시한다', async () => {
    renderPage()

    expect(screen.getByRole('status')).toHaveTextContent('보호소 공고를 불러오는 중입니다.')
    expect(
      await screen.findByRole('heading', { name: '믹스견 · 흰색 · 수컷 보호 중' }),
    ).toBeVisible()
    expect(screen.getByText('411314202600123')).toBeVisible()
    expect(screen.getByText('보호소 보호 중')).toBeVisible()
    expect(screen.getByText('보호중')).toBeVisible()
    expect(screen.getByText('02-1234-5678')).toBeVisible()
    expect(screen.getByRole('img', { name: /믹스견.*사진 1/ })).toBeVisible()
  })

  it('존재하지 않는 보호 ID는 찾을 수 없다고 안내한다', async () => {
    server.use(
      http.get('*/api/animals/:desertionNo', () => new HttpResponse(null, { status: 404 })),
    )
    renderPage('missing-id')

    expect(await screen.findByRole('alert')).toHaveTextContent('보호소 공고를 찾을 수 없습니다.')
  })

  it('조회 오류가 발생하면 다시 시도할 수 있다', async () => {
    let requestCount = 0
    server.use(
      http.get('*/api/animals/:desertionNo', () => {
        requestCount += 1
        return requestCount === 1
          ? HttpResponse.json({ message: '실패' }, { status: 500 })
          : HttpResponse.json({
              desertionNo: '411314202600123',
              kindNm: '믹스견',
              colorCd: '흰색',
              sexCd: 'M',
            })
      }),
    )
    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('보호소 공고를 불러오지 못했습니다.')
    await user.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(
      await screen.findByRole('heading', { name: '믹스견 · 흰색 · 수컷 보호 중' }),
    ).toBeVisible()
  })
})
