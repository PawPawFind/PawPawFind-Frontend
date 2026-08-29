import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { server } from '@/mocks/server'
import { renderWithQueryClient } from '@/test/render'
import type {
  SightingReportFormPageProps,
  SightingReportFormSubmission,
} from '@/features/sighting-reports/pages/SightingReportFormPage'
import { SightingReportFormRoute } from './SightingReportFormRoute'

function createSubmission(): SightingReportFormSubmission {
  return {
    report: {
      reportType: 'FOUND',
      title: '연남동 목격 제보',
      species: 'DOG',
      size: 'SMALL',
      eventDate: '2026-08-30',
      eventHour: 12,
      happenPlace: '서울 마포구 연남동',
      latitude: 37.5,
      longitude: 126.9,
    },
    features: [],
    photos: [
      {
        file: new File(['photo'], 'sighting-dog.png', { type: 'image/png' }),
        sortOrder: 1,
      },
    ],
  }
}

vi.mock('@/features/sighting-reports', () => ({
  SightingReportFormPage: ({
    errorMessage,
    isSubmitting,
    onSubmit,
  }: SightingReportFormPageProps) => (
    <>
      {errorMessage && <p role="alert">{errorMessage}</p>}
      <button disabled={isSubmitting} onClick={() => onSubmit?.(createSubmission())} type="button">
        테스트 제보 등록
      </button>
    </>
  ),
}))

afterEach(() => vi.unstubAllGlobals())

describe('SightingReportFormRoute', () => {
  it('기존 제보 정리에 성공하기 전에는 새 제보를 생성하지 않는다', async () => {
    let createReportRequestCount = 0
    let presignRequestCount = 0
    let deleteReportRequestCount = 0
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 200 })))
    server.use(
      http.post('*/api/reports', () => {
        createReportRequestCount += 1
        return HttpResponse.json({ reportId: createReportRequestCount === 1 ? 401 : 402 })
      }),
      http.post('*/api/uploads/presign', () => {
        presignRequestCount += 1
        return presignRequestCount === 1
          ? HttpResponse.json({ message: '업로드 URL 발급 실패' }, { status: 500 })
          : HttpResponse.json({
              uploadUrl: 'https://uploads.test/sighting-dog.png',
              photoUrl: 'https://cdn.test/sighting-dog.png',
              objectKey: 'reports/sighting-dog.png',
            })
      }),
      http.delete('*/api/reports/:reportId', () => {
        deleteReportRequestCount += 1
        return deleteReportRequestCount < 3
          ? HttpResponse.json({ message: '제보 정리 실패' }, { status: 500 })
          : new HttpResponse(null, { status: 200 })
      }),
    )
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/sightings/new']}>
        <Routes>
          <Route element={<SightingReportFormRoute />} path="/sightings/new" />
          <Route element={<h1>목격 제보 목록 화면</h1>} path="/sightings" />
        </Routes>
      </MemoryRouter>,
    )
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: '테스트 제보 등록' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '다시 시도하면 이전 제보를 먼저 정리합니다.',
    )
    expect(createReportRequestCount).toBe(1)
    expect(deleteReportRequestCount).toBe(1)

    await user.click(screen.getByRole('button', { name: '테스트 제보 등록' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '이전 제보를 정리하지 못해 새 제보를 만들지 않았습니다.',
    )
    expect(createReportRequestCount).toBe(1)
    expect(deleteReportRequestCount).toBe(2)

    await user.click(screen.getByRole('button', { name: '테스트 제보 등록' }))
    expect(await screen.findByRole('heading', { name: '목격 제보 목록 화면' })).toBeInTheDocument()
    expect(createReportRequestCount).toBe(2)
    expect(deleteReportRequestCount).toBe(3)
  })
})
