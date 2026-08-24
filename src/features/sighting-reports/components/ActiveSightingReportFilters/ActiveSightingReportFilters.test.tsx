import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ActiveSightingReportFilters } from './ActiveSightingReportFilters'

describe('ActiveSightingReportFilters', () => {
  it('선택이 없으면 아무것도 표시하지 않는다', () => {
    const { container } = render(<ActiveSightingReportFilters filters={[]} onRemove={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('필터의 접근 가능한 제거 버튼을 제공한다', async () => {
    const onRemove = vi.fn()
    const user = userEvent.setup()
    render(
      <ActiveSightingReportFilters
        filters={[{ value: 'dog', label: '강아지' }]}
        onRemove={onRemove}
      />,
    )
    await user.click(screen.getByRole('button', { name: '강아지 필터 제거' }))
    expect(onRemove).toHaveBeenCalledWith('dog')
  })
})
