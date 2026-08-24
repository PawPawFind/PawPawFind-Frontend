import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { SegmentedControl } from './SegmentedControl'

const options = [
  { value: 'dog', label: '강아지' },
  { value: 'cat', label: '고양이' },
] as const

describe('SegmentedControl', () => {
  it('단일 선택 상태와 그룹 이름을 전달한다', () => {
    render(
      <SegmentedControl
        ariaLabel="동물 종류"
        onValueChange={vi.fn()}
        options={options}
        value="dog"
      />,
    )

    expect(screen.getByRole('radiogroup', { name: '동물 종류' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '강아지' })).toBeChecked()
    expect(screen.getByRole('radio', { name: '고양이' })).not.toBeChecked()
  })

  it('사용처가 controlled 상태를 변경할 수 있다', async () => {
    const user = userEvent.setup()

    function Example() {
      const [value, setValue] = useState<'dog' | 'cat'>('dog')
      return (
        <SegmentedControl
          ariaLabel="동물 종류"
          onValueChange={setValue}
          options={options}
          value={value}
        />
      )
    }

    render(<Example />)
    await user.click(screen.getByRole('radio', { name: '고양이' }))

    expect(screen.getByRole('radio', { name: '고양이' })).toBeChecked()
    expect(screen.getByRole('radio', { name: '강아지' })).not.toBeChecked()
  })

  it('disabled option은 변경 callback을 호출하지 않는다', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    render(
      <SegmentedControl
        ariaLabel="동물 종류"
        onValueChange={handleChange}
        options={[options[0], { ...options[1], disabled: true }]}
        value="dog"
      />,
    )

    await user.click(screen.getByRole('radio', { name: '고양이' }))
    expect(screen.getByRole('radio', { name: '고양이' })).toBeDisabled()
    expect(handleChange).not.toHaveBeenCalled()
  })
})
