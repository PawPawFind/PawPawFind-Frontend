import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SightingReportPagination } from './SightingReportPagination'

describe('SightingReportPagination', () => {
  it('한 페이지만 있으면 표시하지 않는다', () => {
    const { container } = render(
      <SightingReportPagination currentPage={0} onPageChange={vi.fn()} totalPages={1} />,
    )
    expect(container).toBeEmptyDOMElement()
  })
  it('현재 페이지와 경계의 disabled 상태를 표시한다', () => {
    render(<SightingReportPagination currentPage={0} onPageChange={vi.fn()} totalPages={3} />)
    expect(screen.getByRole('button', { name: '이전 페이지' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '1페이지' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: '다음 페이지' })).toBeEnabled()
  })
  it('페이지 선택을 0-based 값으로 알린다', async () => {
    const onPageChange = vi.fn()
    const user = userEvent.setup()
    render(<SightingReportPagination currentPage={1} onPageChange={onPageChange} totalPages={3} />)
    await user.click(screen.getByRole('button', { name: '3페이지' }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })
})
