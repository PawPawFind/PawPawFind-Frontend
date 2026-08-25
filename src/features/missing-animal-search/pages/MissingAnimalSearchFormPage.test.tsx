import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ReportLocationPickerProps } from '@/features/report-location'
import { DEFAULT_REPORT_LOCATION } from '@/types/report'
import { MissingAnimalSearchFormPage } from './MissingAnimalSearchFormPage'

vi.mock('@/features/report-location', () => ({
  ReportLocationPicker: ({ heading, onValueChange, value }: ReportLocationPickerProps) => (
    <div>
      <button
        onClick={() =>
          onValueChange({
            happenPlace: '서울 강서구 화곡동',
            latitude: '37.541',
            longitude: '126.84',
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

async function fillRequiredStepOne(user: User, photo?: File) {
  await user.upload(
    screen.getByLabelText('실종 동물 사진 선택'),
    photo ?? new File(['photo'], 'missing-animal.jpg', { type: 'image/jpeg' }),
  )
  await user.click(screen.getByRole('button', { name: '실종 장소 테스트 위치 선택' }))
  await user.click(
    within(screen.getByRole('group', { name: /털색/ })).getByRole('button', { name: '흰색' }),
  )
}

async function goToFeatureStep(user: User) {
  await fillRequiredStepOne(user)
  await user.click(screen.getByRole('button', { name: '다음 · 특징 고르기' }))
}

describe('MissingAnimalSearchFormPage', () => {
  it('제목 없이 목격 제보와 같은 사진 입력을 제공한다', () => {
    render(<MissingAnimalSearchFormPage />)

    expect(
      screen.getByRole('heading', { name: '잃어버린 아이의 정보를 알려주세요' }),
    ).toBeInTheDocument()
    expect(screen.getByText('STEP 1 / 2')).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /제목/ })).not.toBeInTheDocument()

    const photoInput = screen.getByLabelText('실종 동물 사진 선택')
    expect(photoInput).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp')
    expect(photoInput).toHaveAttribute('multiple')
    expect(screen.queryByLabelText('정면 사진 선택')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('측면 사진 선택')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('전신 사진 선택')).not.toBeInTheDocument()
    expect(screen.getByLabelText(/^잃어버린 날짜\s*\*$/)).toHaveValue(getTodayDateInputValue())
    expect(screen.getByTestId('test-location-value')).toHaveTextContent(
      DEFAULT_REPORT_LOCATION.happenPlace,
    )
    expect(
      screen.getByRole('button', {
        name: '잃어버린 시간대 시간을 잘 모르겠어요',
      }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: '상세 설명' })).not.toBeInTheDocument()
  })

  it('필수 정보를 입력하면 특징 선택 단계로 이동한다', async () => {
    const user = userEvent.setup()
    render(<MissingAnimalSearchFormPage />)

    const nextButton = screen.getByRole('button', { name: '다음 · 특징 고르기' })
    expect(nextButton).toBeDisabled()

    await fillRequiredStepOne(user)

    expect(nextButton).toBeEnabled()
    await user.click(nextButton)

    expect(
      screen.getByRole('heading', { name: '잃어버린 아이의 특징을 골라주세요' }),
    ).toBeInTheDocument()
    expect(screen.getByText('STEP 2 / 2')).toBeInTheDocument()
    expect(
      screen.getByText(
        '모두 건너뛰어도 검색할 수 있어요. 고른 특징은 비슷한 목격 제보를 좁혀보는 조건으로 쓰여요.',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '동물 특징' })).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: '동물 특징' })).toBeInTheDocument()
  })

  it('실종 정보와 선택한 특징을 LOST 제보 구조로 전달한다', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const photo = new File(['photo'], 'missing-dog.jpg', { type: 'image/jpeg' })
    render(<MissingAnimalSearchFormPage onSubmit={onSubmit} />)

    await fillRequiredStepOne(user, photo)
    const eventDateInput = screen.getByLabelText(/^잃어버린 날짜\s*\*$/)
    await user.clear(eventDateInput)
    await user.type(eventDateInput, '2026-08-22')
    await user.click(screen.getByRole('radio', { name: '고양이' }))
    await user.click(screen.getByRole('radio', { name: '대형' }))
    await user.click(screen.getByRole('button', { name: '잃어버린 시간대 시간을 잘 모르겠어요' }))
    await user.click(screen.getByRole('option', { name: '14–16시' }))
    await user.click(screen.getByRole('button', { name: '다음 · 특징 고르기' }))
    await user.click(
      within(screen.getByRole('group', { name: '귀' })).getByRole('button', { name: '접힘' }),
    )
    await user.click(screen.getByRole('button', { name: '비슷한 동물 찾아보기' }))

    expect(onSubmit).toHaveBeenCalledWith({
      report: {
        reportType: 'LOST',
        species: 'CAT',
        size: 'LARGE',
        eventDate: '2026-08-22',
        eventHour: 15,
        happenPlace: '서울 강서구 화곡동',
        latitude: 37.541,
        longitude: 126.84,
      },
      features: [
        { category: '털색', keyword: '흰색' },
        { category: '귀', keyword: '접힌 귀' },
      ],
      photos: [{ file: photo, sortOrder: 1 }],
    })
  })

  it('이전 단계로 돌아가도 입력값을 유지한다', async () => {
    const user = userEvent.setup()
    render(<MissingAnimalSearchFormPage />)

    await goToFeatureStep(user)
    await user.click(screen.getByRole('button', { name: /이전 단계/ }))

    expect(screen.getByTestId('test-location-value')).toHaveTextContent('서울 강서구 화곡동')
    expect(screen.getByRole('list', { name: '선택한 실종 동물 사진' })).toBeInTheDocument()
  })

  it('하나의 입력에서 사진을 최대 3장까지 선택하고 다시 제거할 수 있다', async () => {
    const user = userEvent.setup()
    render(<MissingAnimalSearchFormPage />)
    const photoInput = screen.getByLabelText('실종 동물 사진 선택')
    const photos = [
      new File(['one'], 'one.jpg', { type: 'image/jpeg' }),
      new File(['two'], 'two.jpg', { type: 'image/jpeg' }),
      new File(['three'], 'three.jpg', { type: 'image/jpeg' }),
      new File(['four'], 'four.jpg', { type: 'image/jpeg' }),
    ]

    await user.upload(photoInput, photos)

    const previews = within(screen.getByRole('list', { name: '선택한 실종 동물 사진' }))

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
})
