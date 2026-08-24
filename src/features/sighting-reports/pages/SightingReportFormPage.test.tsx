import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ReportLocationPickerProps } from '@/features/report-location'
import { DEFAULT_REPORT_LOCATION } from '@/types/report'
import { SightingReportFormPage } from './SightingReportFormPage'

vi.mock('@/features/report-location', () => ({
  ReportLocationPicker: ({ heading, onValueChange, value }: ReportLocationPickerProps) => (
    <div>
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
        {heading} 테스트 위치 선택
      </button>
      <span data-testid="test-location-value">{value.happenPlace}</span>
    </div>
  ),
}))

type User = ReturnType<typeof userEvent.setup>

function getTodayDateInputValue() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

async function fillRequiredStepOne(user: User) {
  await user.type(screen.getByRole('textbox', { name: /제목/ }), '연남동에서 강아지를 봤어요')
  await user.click(screen.getByRole('button', { name: '발견 장소 테스트 위치 선택' }))
  const eventDateInput = screen.getByLabelText(/^발견 날짜\s*\*$/)
  await user.clear(eventDateInput)
  await user.type(eventDateInput, '2026-08-23')
  await user.click(
    within(screen.getByRole('group', { name: /색상/ })).getByRole('button', { name: '흰색' }),
  )
}

async function goToFeatureStep(user: User) {
  await fillRequiredStepOne(user)
  await user.upload(
    screen.getByLabelText('목격 사진 선택'),
    new File(['photo'], 'required-photo.jpg', { type: 'image/jpeg' }),
  )
  await user.click(screen.getByRole('button', { name: '다음 · 특징 고르기' }))
}

describe('SightingReportFormPage', () => {
  it('목격 제보 1단계에서 제목과 사진을 받는다', () => {
    render(<SightingReportFormPage />)

    expect(
      screen.getByRole('heading', { name: '목격한 동물의 사진을 올려주세요' }),
    ).toBeInTheDocument()
    expect(screen.getByText('STEP 1 / 2')).toBeInTheDocument()

    const titleInput = screen.getByRole('textbox', { name: /제목/ })
    const photoHeading = screen.getByRole('heading', { name: '사진' })

    expect(titleInput).toBeRequired()
    expect(
      titleInput.compareDocumentPosition(photoHeading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(screen.getByLabelText('목격 사진 선택')).toHaveAttribute(
      'accept',
      'image/jpeg,image/png,image/webp',
    )
    expect(screen.getByLabelText('목격 사진 선택')).toHaveAttribute('multiple')
    expect(screen.getByLabelText(/^발견 날짜\s*\*$/)).toHaveValue(getTodayDateInputValue())
    expect(screen.getByTestId('test-location-value')).toHaveTextContent(
      DEFAULT_REPORT_LOCATION.happenPlace,
    )
    expect(screen.queryByRole('textbox', { name: '상세 설명' })).not.toBeInTheDocument()
    expect(screen.queryByRole('group', { name: '귀' })).not.toBeInTheDocument()

    const whiteChip = within(screen.getByRole('group', { name: /색상/ })).getByRole('button', {
      name: '흰색',
    })
    expect(whiteChip.querySelector('.sighting-report-form__color-swatch')).toHaveStyle({
      backgroundColor: '#ffffff',
    })
  })

  it('필수값과 선택한 특징을 2단계에서 서버 코드 구조로 전달한다', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const photo = new File(['photo'], 'sighting-dog.jpg', { type: 'image/jpeg' })
    render(<SightingReportFormPage onSubmit={onSubmit} />)

    const nextButton = screen.getByRole('button', { name: '다음 · 특징 고르기' })
    expect(nextButton).toBeDisabled()

    await fillRequiredStepOne(user)
    await user.upload(screen.getByLabelText('목격 사진 선택'), photo)
    expect(screen.getByRole('img', { name: '선택한 목격 사진 1' })).toHaveAttribute(
      'src',
      'blob:sighting-dog.jpg',
    )
    expect(screen.queryByText(/sighting-dog\.jpg/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: '고양이' }))
    await user.click(screen.getByRole('radio', { name: '대형' }))
    await user.click(screen.getByRole('button', { name: '발견 시간대 시간을 잘 모르겠어요' }))
    await user.click(screen.getByRole('option', { name: '14–16시' }))

    expect(nextButton).toBeEnabled()
    await user.click(nextButton)

    expect(screen.getByText('STEP 2 / 2')).toBeInTheDocument()
    await user.click(
      within(screen.getByRole('group', { name: '귀' })).getByRole('button', { name: '접힘' }),
    )
    await user.click(screen.getByRole('button', { name: '제보 등록하기' }))

    expect(onSubmit).toHaveBeenCalledWith({
      report: {
        reportType: 'FOUND',
        title: '연남동에서 강아지를 봤어요',
        species: 'CAT',
        size: 'LARGE',
        eventDate: '2026-08-23',
        eventHour: 15,
        happenPlace: '서울 마포구 연남동',
        latitude: 37.5665,
        longitude: 126.978,
      },
      features: [
        { category: '털색', keyword: '흰색' },
        { category: '귀', keyword: '접힌 귀' },
      ],
      photos: [{ file: photo, sortOrder: 1 }],
    })
  })

  it('제목·사진·기본 정보·위치·날짜·색상을 모두 입력하면 다음 버튼을 활성화한다', async () => {
    const user = userEvent.setup()
    const photo = new File(['photo'], 'required-photo.jpg', { type: 'image/jpeg' })
    render(<SightingReportFormPage />)

    const nextButton = screen.getByRole('button', { name: '다음 · 특징 고르기' })
    await fillRequiredStepOne(user)

    expect(nextButton).toBeDisabled()

    await user.upload(screen.getByLabelText('목격 사진 선택'), photo)

    expect(nextButton).toBeEnabled()
  })

  it('이전 단계로 돌아가도 입력값을 유지한다', async () => {
    const user = userEvent.setup()
    render(<SightingReportFormPage />)

    await goToFeatureStep(user)
    await user.click(screen.getByRole('button', { name: /이전 단계/ }))

    expect(screen.getByRole('textbox', { name: /제목/ })).toHaveValue('연남동에서 강아지를 봤어요')
    expect(screen.getByTestId('test-location-value')).toHaveTextContent('서울 마포구 연남동')
  })

  it('단일 선택 특징은 다른 값을 누르면 선택을 바로 교체한다', async () => {
    const user = userEvent.setup()
    render(<SightingReportFormPage />)
    await goToFeatureStep(user)

    const ears = within(screen.getByRole('group', { name: '귀' }))
    const uprightEars = ears.getByRole('button', { name: '쫑긋' })
    const foldedEars = ears.getByRole('button', { name: '접힘' })

    await user.click(uprightEars)

    expect(uprightEars).toHaveAttribute('aria-pressed', 'true')
    expect(foldedEars).toBeEnabled()
    await user.click(foldedEars)

    expect(foldedEars).toHaveAttribute('aria-pressed', 'true')
    expect(uprightEars).toHaveAttribute('aria-pressed', 'false')
    expect(uprightEars).toBeEnabled()
  })

  it('디자인에 정의된 특징 분류와 선택값을 모두 표시한다', async () => {
    const user = userEvent.setup()
    render(<SightingReportFormPage />)
    await goToFeatureStep(user)

    expect(screen.getByRole('heading', { name: '기억나는 특징을 골라주세요' })).toBeInTheDocument()
    expect(
      screen.getByText(
        '모두 건너뛰어도 등록돼요. 고른 특징은 보호자가 찾을 때 검색 조건으로 쓰여요.',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '동물 특징' })).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: '동물 특징' })).toBeInTheDocument()

    const expectedGroups = [
      ['털 길이', ['짧음', '중간', '김', '짧게 깎임', '엉킴']],
      ['귀', ['쫑긋', '접힘', '한쪽만 접힘', '끝 잘림']],
      ['꼬리', ['김', '짧음', '말림', '없음']],
      ['눈·얼굴', ['눈 색 다름', '코가 검정', '코가 분홍', '주둥이 흰 털']],
      ['착용 중', ['목줄 없음', '목줄 있음', '하네스', '인식표', '옷']],
      ['몸 상태', ['다리 절뚝임', '말랐음', '털 빠짐', '상처 있음', '임신·수유 중']],
      ['행동', ['사람 잘 따름', '경계심 강함', '겁이 많음', '짖음']],
    ] as const

    expectedGroups.forEach(([groupName, optionNames]) => {
      const group = within(screen.getByRole('group', { name: groupName }))

      optionNames.forEach((optionName) => {
        expect(group.getByRole('button', { name: optionName })).toBeInTheDocument()
      })
    })
  })

  it('털색은 네 번째 색을 누르면 가장 먼저 선택한 색을 교체한다', async () => {
    const user = userEvent.setup()
    render(<SightingReportFormPage />)
    const colors = within(screen.getByRole('group', { name: /색상/ }))
    const white = colors.getByRole('button', { name: '흰색' })
    const cream = colors.getByRole('button', { name: '크림' })
    const brown = colors.getByRole('button', { name: '갈색' })
    const gray = colors.getByRole('button', { name: '회색' })
    const black = colors.getByRole('button', { name: '검정' })

    await user.click(white)
    await user.click(cream)
    await user.click(brown)

    expect(gray).toBeEnabled()
    expect(black).toBeEnabled()
    await user.click(gray)

    expect(white).toHaveAttribute('aria-pressed', 'false')
    expect(cream).toHaveAttribute('aria-pressed', 'true')
    expect(brown).toHaveAttribute('aria-pressed', 'true')
    expect(gray).toHaveAttribute('aria-pressed', 'true')

    await user.click(black)

    expect(cream).toHaveAttribute('aria-pressed', 'false')
    expect(brown).toHaveAttribute('aria-pressed', 'true')
    expect(gray).toHaveAttribute('aria-pressed', 'true')
    expect(black).toHaveAttribute('aria-pressed', 'true')
  })

  it('하나의 입력에서 사진을 최대 3장까지 선택하고 다시 제거할 수 있다', async () => {
    const user = userEvent.setup()
    render(<SightingReportFormPage />)
    const photoInput = screen.getByLabelText('목격 사진 선택')
    const photos = [
      new File(['one'], 'one.jpg', { type: 'image/jpeg' }),
      new File(['two'], 'two.jpg', { type: 'image/jpeg' }),
      new File(['three'], 'three.jpg', { type: 'image/jpeg' }),
      new File(['four'], 'four.jpg', { type: 'image/jpeg' }),
    ]

    await user.upload(photoInput, photos)

    const previews = within(screen.getByRole('list', { name: '선택한 목격 사진' }))

    expect(previews.getAllByRole('img').map((image) => image.getAttribute('src'))).toEqual([
      'blob:one.jpg',
      'blob:two.jpg',
      'blob:three.jpg',
    ])
    expect(screen.queryByText(/\.jpg/)).not.toBeInTheDocument()
    expect(photoInput).toBeDisabled()

    await user.click(screen.getByRole('button', { name: '사진 2 제거' }))

    expect(previews.getAllByRole('img').map((image) => image.getAttribute('src'))).toEqual([
      'blob:one.jpg',
      'blob:three.jpg',
    ])
    expect(photoInput).toBeEnabled()
  })

  it('등록 중에는 중복 제출을 막고 API 오류를 안내한다', async () => {
    render(
      <SightingReportFormPage
        errorMessage="제보를 등록하지 못했습니다. 다시 시도해 주세요."
        isSubmitting
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      '제보를 등록하지 못했습니다. 다시 시도해 주세요.',
    )
    expect(document.querySelector('form')).toHaveAttribute('aria-busy', 'true')
  })
})
