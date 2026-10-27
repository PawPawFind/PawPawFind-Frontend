import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ReportImageAnalysisResult } from '../../analysis/reportImageAnalysis.types'
import { PhotoFirstReportForm } from './PhotoFirstReportForm'

const scrollToMock = vi.fn()
Object.defineProperty(window, 'scrollTo', {
  configurable: true,
  value: scrollToMock,
})

vi.mock('@/features/report-location', () => ({
  ReportLocationPicker: ({
    heading,
    onValueChange,
  }: {
    heading: string
    onValueChange: (value: { happenPlace: string; latitude: string; longitude: string }) => void
  }) => (
    <section aria-label={heading}>
      <button
        onClick={() =>
          onValueChange({
            happenPlace: '서울 마포구 연남동',
            latitude: '37.5665',
            longitude: '126.978',
          })
        }
        type="button"
      >
        테스트 장소 선택
      </button>
    </section>
  ),
}))

const analysisResult: ReportImageAnalysisResult = {
  requestId: 'test-analysis',
  species: 'DOG',
  features: [
    { category: '털색', keyword: '검정' },
    { category: '털색', keyword: '흰색' },
    { category: '무늬', keyword: '얼룩무늬' },
    { category: '털길이', keyword: '김' },
    { category: '귀', keyword: '쫑긋' },
    { category: '꼬리', keyword: '김' },
    { category: '눈/얼굴', keyword: '주둥이 흰 털' },
    { category: '착용 중', keyword: '목줄 있음' },
  ],
  breedCandidates: [
    { id: 'dog:border_collie', labelKo: '보더콜리', labelEn: 'Border Collie', rank: 1 },
  ],
  warnings: [],
}

async function fillRequiredStepOne(
  user: ReturnType<typeof userEvent.setup>,
  mode: 'sighting' | 'missing',
) {
  const photo = new File(['photo'], 'dog.jpg', { type: 'image/jpeg' })
  const formLabel = mode === 'sighting' ? '목격 제보' : '실종 동물 찾기'
  const eventLabel = mode === 'sighting' ? '발견' : '실종'

  await user.upload(screen.getByLabelText(`${formLabel} 사진 선택`), photo)
  await user.click(screen.getByRole('button', { name: '테스트 장소 선택' }))
  await user.click(screen.getByRole('button', { name: new RegExp(`${eventLabel} 시간대`) }))
  await user.click(screen.getByRole('option', { name: '14–16시' }))

  return photo
}

describe('PhotoFirstReportForm', () => {
  it('필수 정보를 받은 뒤 분석 중 CTA를 보여주고 완료되면 접힌 검토 화면으로 이동한다', async () => {
    const user = userEvent.setup()
    let resolveAnalysis: ((result: ReportImageAnalysisResult) => void) | undefined
    const analyzeImage = vi.fn(
      () =>
        new Promise<ReportImageAnalysisResult>((resolve) => {
          resolveAnalysis = resolve
        }),
    )

    render(<PhotoFirstReportForm analyzeImage={analyzeImage} mode="sighting" />)

    expect(screen.getByLabelText(/발견 날짜/, { selector: 'input' })).toBeRequired()
    expect(
      screen.getByRole('button', { name: '발견 시간대 필수 시간대를 선택해 주세요' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('목격 제보 사진 선택').closest('label')).toHaveAttribute(
      'title',
      '사진 추가',
    )
    const nextButton = screen.getByRole('button', { name: '다음' })
    expect(screen.getByRole('region', { name: '발견 장소' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '테스트 장소 선택' })).toBeInTheDocument()
    expect(nextButton).toBeDisabled()
    await fillRequiredStepOne(user, 'sighting')
    expect(nextButton).toBeEnabled()

    await user.click(nextButton)

    expect(screen.getByRole('button', { name: '이미지 AI 분석 중' })).toBeDisabled()
    expect(analyzeImage).toHaveBeenCalledOnce()

    await act(async () => resolveAnalysis?.(analysisResult))

    expect(scrollToMock).toHaveBeenCalledWith({ behavior: 'auto', left: 0, top: 0 })
    expect(screen.getByRole('button', { name: '이전 단계로' })).toBeInTheDocument()
    expect(screen.getByText('2 / 2')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '사진을 보고 특징을 채웠어요' })).toHaveFocus()
    expect(screen.getByRole('textbox', { name: /제보 제목/ })).toHaveValue(
      '연남동에서 검정·흰색 강아지를 봤어요',
    )
    expect(screen.getByRole('button', { name: /동물 종류 필수 강아지 AI/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.queryByRole('button', { name: '고양이' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '회색' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '목격 제보 등록하기' })).toBeEnabled()
  })

  it('한 번에 한 특징만 열고 AI 값을 바꾸면 수정함 상태와 제출값을 갱신한다', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const analyzeImage = vi.fn().mockResolvedValue(analysisResult)
    render(<PhotoFirstReportForm analyzeImage={analyzeImage} mode="sighting" onSubmit={onSubmit} />)
    const photo = await fillRequiredStepOne(user, 'sighting')
    await user.click(screen.getByRole('button', { name: '다음' }))
    await screen.findByRole('heading', { name: '사진을 보고 특징을 채웠어요' })

    await user.click(screen.getByRole('button', { name: /동물 종류 필수 강아지 AI/ }))
    expect(screen.getByRole('button', { name: '고양이' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /털색 검정 · 흰색 AI/ }))
    expect(screen.queryByRole('button', { name: '고양이' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '회색' }))

    expect(
      screen.getByRole('button', { name: /털색 검정 · 흰색 · 회색 수정함/ }),
    ).toBeInTheDocument()
    expect(screen.getByText('수정함')).not.toHaveClass('ds-badge')

    await user.click(screen.getByRole('button', { name: '목격 제보 등록하기' }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        report: expect.objectContaining({
          reportType: 'FOUND',
          size: null,
          species: 'DOG',
          title: '연남동에서 검정·흰색·회색 강아지를 봤어요',
        }),
        photos: [{ file: photo, sortOrder: 1 }],
      }),
    )
  })

  it('사용자가 제목을 고친 뒤에는 특징을 바꿔도 자동 제목을 덮어쓰지 않는다', async () => {
    const user = userEvent.setup()
    render(
      <PhotoFirstReportForm
        analyzeImage={vi.fn().mockResolvedValue(analysisResult)}
        mode="sighting"
      />,
    )
    await fillRequiredStepOne(user, 'sighting')
    await user.click(screen.getByRole('button', { name: '다음' }))

    const titleInput = await screen.findByRole('textbox', { name: /제보 제목/ })
    await user.clear(titleInput)
    await user.type(titleInput, '직접 작성한 제목')
    await user.click(screen.getByRole('button', { name: /크기 선택 안 함/ }))
    await user.click(screen.getByRole('button', { name: '중형' }))

    expect(titleInput).toHaveValue('직접 작성한 제목')
  })

  it('분석 실패 시 AI 표시를 숨기고 동물 종류만 선택하면 실종 검색을 제출한다', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <PhotoFirstReportForm
        analyzeImage={vi.fn().mockRejectedValue(new Error('분석 실패'))}
        mode="missing"
        onSubmit={onSubmit}
      />,
    )
    await fillRequiredStepOne(user, 'missing')
    await user.click(screen.getByRole('button', { name: '다음' }))

    expect(
      await screen.findByText('사진을 분석하지 못했어요. 동물 종류만 골라주시면 등록할 수 있어요.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('개 그대로 사용')).not.toBeInTheDocument()
    expect(screen.queryByText('AI')).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /제보 제목/ })).not.toBeInTheDocument()

    const submitButton = screen.getByRole('button', { name: '비슷한 동물 찾기' })
    expect(submitButton).toBeDisabled()
    expect(
      screen.getByRole('button', { name: /동물 종류 필수 확인하지 못했어요/ }),
    ).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: '강아지' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '강아지' }))
    expect(submitButton).toBeEnabled()

    await user.click(submitButton)

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        report: expect.objectContaining({ reportType: 'LOST', size: null, species: 'DOG' }),
      }),
    )
  })

  it('AI가 동물 종류만 확인하지 못하면 필수 행을 열고 선택 전 제출을 막는다', async () => {
    const user = userEvent.setup()
    const partialAnalysisResult: ReportImageAnalysisResult = {
      ...analysisResult,
      species: null,
    }

    render(
      <PhotoFirstReportForm
        analyzeImage={vi.fn().mockResolvedValue(partialAnalysisResult)}
        mode="missing"
      />,
    )
    await fillRequiredStepOne(user, 'missing')
    await user.click(screen.getByRole('button', { name: '다음' }))

    expect(
      await screen.findByText('동물 종류를 확인하지 못했어요. 강아지 또는 고양이를 골라주세요.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /동물 종류 필수 확인하지 못했어요/ }),
    ).toHaveAttribute('aria-expanded', 'true')

    const submitButton = screen.getByRole('button', { name: '비슷한 동물 찾기' })
    expect(submitButton).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '고양이' }))
    expect(submitButton).toBeEnabled()
  })

  it('품종 후보를 자동 선택하지 않고 사용자가 펼쳐서 선택하게 한다', async () => {
    const user = userEvent.setup()
    render(
      <PhotoFirstReportForm
        analyzeImage={vi.fn().mockResolvedValue(analysisResult)}
        mode="missing"
      />,
    )
    await fillRequiredStepOne(user, 'missing')
    await user.click(screen.getByRole('button', { name: '다음' }))

    const breedRow = await screen.findByRole('button', { name: /품종 후보 1개 · 선택 안 함/ })
    expect(breedRow).toHaveAttribute('aria-expanded', 'false')
    await user.click(breedRow)

    const breedPanel = screen.getByRole('group', { name: '품종' })
    expect(within(breedPanel).getByRole('button', { name: '보더콜리' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(within(breedPanel).queryByText('Border Collie')).not.toBeInTheDocument()
  })
})
