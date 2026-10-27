import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MissingAnimalSearchFormPage } from './MissingAnimalSearchFormPage'

describe('MissingAnimalSearchFormPage', () => {
  it('실종 동물 찾기 mode의 공통 사진 우선 폼을 렌더링한다', () => {
    render(<MissingAnimalSearchFormPage />)

    expect(screen.queryByText('실종 동물 찾기')).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '잃어버린 아이의 정보를 알려주세요' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('실종 동물 찾기 사진 선택')).toBeInTheDocument()
  })
})
