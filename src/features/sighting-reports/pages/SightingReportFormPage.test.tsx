import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SightingReportFormPage } from './SightingReportFormPage'

describe('SightingReportFormPage', () => {
  it('목격 제보 mode의 공통 사진 우선 폼을 렌더링한다', () => {
    render(<SightingReportFormPage />)

    expect(screen.queryByText('목격 제보')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '발견한 동물을 알려주세요' })).toBeInTheDocument()
    expect(screen.getByLabelText('목격 제보 사진 선택')).toBeInTheDocument()
  })
})
