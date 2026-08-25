import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SelectableChip } from './SelectableChip'

describe('SelectableChip', () => {
  it('선택 여부를 aria-pressed로 전달한다', () => {
    const { rerender } = render(<SelectableChip selected={false}>강아지</SelectableChip>)
    const chip = screen.getByRole('button', { name: '강아지' })

    expect(chip).toHaveAttribute('aria-pressed', 'false')

    rerender(<SelectableChip selected>강아지</SelectableChip>)

    expect(chip).toHaveAttribute('aria-pressed', 'true')
  })

  it('클릭과 키보드 입력을 native button 동작으로 전달한다', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(
      <SelectableChip selected={false} onClick={handleClick}>
        고양이
      </SelectableChip>,
    )

    const chip = screen.getByRole('button', { name: '고양이' })
    await user.click(chip)
    chip.focus()
    await user.keyboard('{Enter}')
    await user.keyboard(' ')

    expect(handleClick).toHaveBeenCalledTimes(3)
  })

  it('disabled 상태에서는 선택 동작을 실행하지 않는다', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(
      <SelectableChip disabled onClick={handleClick} selected={false}>
        중형
      </SelectableChip>,
    )

    const chip = screen.getByRole('button', { name: '중형' })
    await user.click(chip)

    expect(chip).toBeDisabled()
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('기본적으로 form submit을 발생시키지 않는다', async () => {
    const handleSubmit = vi.fn((event: React.FormEvent) => event.preventDefault())
    const user = userEvent.setup()

    render(
      <form onSubmit={handleSubmit}>
        <SelectableChip selected={false}>소형</SelectableChip>
      </form>,
    )

    await user.click(screen.getByRole('button', { name: '소형' }))

    expect(handleSubmit).not.toHaveBeenCalled()
  })
})
