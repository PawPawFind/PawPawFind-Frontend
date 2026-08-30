import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { server } from '@/mocks/server'
import { renderWithQueryClient } from '@/test/render'
import type { MissingAnimalSearchFormPageProps } from './MissingAnimalSearchFormPage'
import { MissingAnimalSearchFlowPage } from './MissingAnimalSearchFlowPage'

vi.mock('./MissingAnimalSearchFormPage', () => ({
  MissingAnimalSearchFormPage: ({ onSubmit }: MissingAnimalSearchFormPageProps) => (
    <button
      onClick={() =>
        onSubmit?.({
          report: {
            reportType: 'LOST',
            species: 'DOG',
            size: 'SMALL',
            eventDate: '2026-08-24',
            eventHour: 12,
            happenPlace: '서울 강서구',
            latitude: 37.5,
            longitude: 126.8,
          },
          features: [],
          photos: [
            {
              file: new File(['photo'], 'missing-dog.png', { type: 'image/png' }),
              sortOrder: 1,
            },
          ],
        })
      }
      type="button"
    >
      테스트 검색 시작
    </button>
  ),
}))

function controlInitialMatchDelay() {
  const setTimeoutSpy = vi.spyOn(window, 'setTimeout')

  return async () => {
    await waitFor(() =>
      expect(setTimeoutSpy.mock.calls.some(([, timeout]) => timeout === 3_000)).toBe(true),
    )
    const callIndex = setTimeoutSpy.mock.calls.findIndex(([, timeout]) => timeout === 3_000)
    const handler = setTimeoutSpy.mock.calls[callIndex]?.[0]
    const timerId = setTimeoutSpy.mock.results[callIndex]?.value

    if (timerId !== undefined) window.clearTimeout(timerId)
    act(() => {
      if (typeof handler === 'function') handler()
    })
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('MissingAnimalSearchFlowPage', () => {
  it('폼 제출 후 실제 등록·매칭 중 분석 화면을 보여주고 reportId 결과로 이동한다', async () => {
    const runInitialMatch = controlInitialMatchDelay()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 200 })))
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/find/new']}>
        <Routes>
          <Route element={<MissingAnimalSearchFlowPage />} path="/find/new" />
          <Route element={<h1>검색 결과 화면</h1>} path="/find/results/:searchId" />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: '테스트 검색 시작' }))
    expect(screen.getByRole('heading', { name: '비슷한 동물을 찾고 있어요' })).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: '유사 동물 검색 중' })).toBeInTheDocument()

    await runInitialMatch()
    expect(await screen.findByRole('heading', { name: '검색 결과 화면' })).toBeInTheDocument()
  })

  it('매칭 재시도는 제보를 중복 생성하지 않고 기존 reportId로 run-match만 다시 요청한다', async () => {
    const runInitialMatch = controlInitialMatchDelay()
    let createReportRequestCount = 0
    let runMatchRequestCount = 0
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 200 })))
    server.use(
      http.post('*/api/reports', () => {
        createReportRequestCount += 1
        return HttpResponse.json({ reportId: 207 })
      }),
      http.post('*/api/reports/:reportId/run-match', ({ params }) => {
        runMatchRequestCount += 1
        return runMatchRequestCount === 1
          ? HttpResponse.json({ message: '매칭 실패' }, { status: 500 })
          : HttpResponse.json({ reportId: Number(params.reportId), results: [] })
      }),
    )
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/find/new']}>
        <Routes>
          <Route element={<MissingAnimalSearchFlowPage />} path="/find/new" />
          <Route element={<h1>검색 결과 화면</h1>} path="/find/results/:searchId" />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: '테스트 검색 시작' }))
    expect(runMatchRequestCount).toBe(0)
    await runInitialMatch()
    const retryButton = await screen.findByRole('button', { name: '다시 시도' })

    expect(
      screen.getByRole('heading', { name: '비슷한 동물 검색을 완료하지 못했어요' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('progressbar', { name: '유사 동물 검색 중' })).not.toBeInTheDocument()
    expect(
      screen.queryByText('전국 보호소와 목격 제보에서 비슷한 동물을 확인하고 있어요.'),
    ).not.toBeInTheDocument()

    fireEvent.click(retryButton)

    expect(await screen.findByRole('heading', { name: '검색 결과 화면' })).toBeInTheDocument()
    expect(createReportRequestCount).toBe(1)
    expect(runMatchRequestCount).toBe(2)
  })

  it('생성된 제보 정리가 실패하면 기존 제보 삭제 후에만 새 제보를 생성한다', async () => {
    const runInitialMatch = controlInitialMatchDelay()
    let createReportRequestCount = 0
    let presignRequestCount = 0
    let deleteReportRequestCount = 0
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 200 })))
    server.use(
      http.post('*/api/reports', () => {
        createReportRequestCount += 1
        return HttpResponse.json({ reportId: createReportRequestCount === 1 ? 301 : 302 })
      }),
      http.post('*/api/uploads/presign', () => {
        presignRequestCount += 1
        return presignRequestCount === 1
          ? HttpResponse.json({ message: '업로드 URL 발급 실패' }, { status: 500 })
          : HttpResponse.json({
              uploadUrl: 'https://uploads.test/missing-dog.png',
              photoUrl: 'https://cdn.test/missing-dog.png',
              objectKey: 'reports/missing-dog.png',
            })
      }),
      http.delete('*/api/reports/:reportId', () => {
        deleteReportRequestCount += 1
        return deleteReportRequestCount === 1
          ? HttpResponse.json({ message: '제보 정리 실패' }, { status: 500 })
          : new HttpResponse(null, { status: 200 })
      }),
    )
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/find/new']}>
        <Routes>
          <Route element={<MissingAnimalSearchFlowPage />} path="/find/new" />
          <Route element={<h1>검색 결과 화면</h1>} path="/find/results/:searchId" />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: '테스트 검색 시작' }))

    expect(
      await screen.findByRole('heading', { name: '이전 제보를 정리하지 못했어요' }),
    ).toBeInTheDocument()
    expect(createReportRequestCount).toBe(1)
    expect(deleteReportRequestCount).toBe(1)

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))

    await runInitialMatch()
    expect(await screen.findByRole('heading', { name: '검색 결과 화면' })).toBeInTheDocument()
    expect(createReportRequestCount).toBe(2)
    expect(deleteReportRequestCount).toBe(2)
  })
})
