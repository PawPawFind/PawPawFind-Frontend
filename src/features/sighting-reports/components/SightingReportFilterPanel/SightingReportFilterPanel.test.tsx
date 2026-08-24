import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SightingReportFilterPanel } from './SightingReportFilterPanel'

const groups = [
  {
    key: 'species',
    label: '동물 종류',
    options: [
      { value: 'dog', label: '강아지' },
      { value: 'cat', label: '고양이' },
    ],
  },
]

describe('SightingReportFilterPanel', () => {
  it('그룹을 펼쳐 controlled 선택 상태를 표시하고 toggle을 알린다', async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()
    render(
      <SightingReportFilterPanel groups={groups} onToggle={onToggle} selectedValues={['dog']} />,
    )
    const disclosure = screen.getByRole('button', { name: /동물 종류.*강아지/ })
    expect(disclosure).toHaveAttribute('aria-expanded', 'false')
    await user.click(disclosure)
    expect(disclosure).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: '강아지' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: '고양이' }))
    expect(onToggle).toHaveBeenCalledWith('cat')
  })

  it('같은 그룹을 다시 누르면 옵션을 접는다', async () => {
    const user = userEvent.setup()
    render(<SightingReportFilterPanel groups={groups} onToggle={vi.fn()} selectedValues={[]} />)
    const disclosure = screen.getByRole('button', { name: '동물 종류' })
    await user.click(disclosure)
    expect(screen.getByRole('button', { name: '고양이' })).toBeInTheDocument()
    await user.click(disclosure)
    expect(screen.queryByRole('button', { name: '고양이' })).not.toBeInTheDocument()
  })
})
