import { fireEvent, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
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

afterEach(() => vi.unstubAllGlobals())

describe('MissingAnimalSearchFlowPage', () => {
  it('폼 제출 후 실제 등록·매칭 중 분석 화면을 보여주고 reportId 결과로 이동한다', async () => {
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

    expect(await screen.findByRole('heading', { name: '검색 결과 화면' })).toBeInTheDocument()
  })
})
