import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { TimeBandSelect } from './TimeBandSelect'

const options = [
  { value: '', label: '시간을 잘 모르겠어요' },
  { value: '13', label: '12–14시' },
  { value: '15', label: '14–16시' },
  { value: '17', label: '16–18시' },
] as const

describe('TimeBandSelect', () => {
  it('label·description·선택값을 trigger에 연결한다', () => {
    render(
      <TimeBandSelect
        description="정확한 시각이 아니어도 괜찮아요."
        label="발견 시간대"
        onValueChange={vi.fn()}
        options={options}
        value="15"
      />,
    )

    const trigger = screen.getByRole('button', { name: '발견 시간대 14–16시' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveAccessibleDescription('정확한 시각이 아니어도 괜찮아요.')
  })

  it('선택 전 placeholder와 required 상태를 접근 가능한 이름에 포함한다', () => {
    render(
      <TimeBandSelect
        label="발견 시간대"
        onValueChange={vi.fn()}
        options={options.filter((option) => option.value !== '')}
        placeholder="시간대를 선택해 주세요"
        required
        value=""
      />,
    )

    expect(
      screen.getByRole('button', { name: '발견 시간대 필수 시간대를 선택해 주세요' }),
    ).toBeInTheDocument()
    expect(screen.getByText('필수')).toBeVisible()
  })

  it('필수 표시를 숨겨도 접근 가능한 이름에는 필수 상태를 유지한다', () => {
    render(
      <TimeBandSelect
        label="발견 시간대"
        onValueChange={vi.fn()}
        options={options.filter((option) => option.value !== '')}
        placeholder="시간대를 선택해 주세요"
        required
        showRequiredIndicator={false}
        value=""
      />,
    )

    expect(
      screen.getByRole('button', { name: '발견 시간대 필수 시간대를 선택해 주세요' }),
    ).toBeInTheDocument()
    expect(screen.getByText('필수')).toHaveClass('ds-time-band-select__required--visually-hidden')
  })

  it('option을 선택하면 controlled value를 바꾸고 menu를 닫는다', async () => {
    const user = userEvent.setup()

    function Example() {
      const [value, setValue] = useState<(typeof options)[number]['value']>('15')
      return (
        <TimeBandSelect
          label="발견 시간대"
          onValueChange={setValue}
          options={options}
          value={value}
        />
      )
    }

    render(<Example />)
    await user.click(screen.getByRole('button', { name: '발견 시간대 14–16시' }))

    expect(screen.getByRole('listbox', { name: '발견 시간대' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '14–16시' })).toHaveAttribute('aria-selected', 'true')

    await user.click(screen.getByRole('option', { name: '16–18시' }))

    expect(screen.getByRole('button', { name: '발견 시간대 16–18시' })).toHaveFocus()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('arrow key와 Enter로 option을 이동하고 선택한다', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    render(
      <TimeBandSelect
        label="발견 시간대"
        onValueChange={handleChange}
        options={options}
        value="15"
      />,
    )

    const trigger = screen.getByRole('button', { name: '발견 시간대 14–16시' })
    trigger.focus()
    await user.keyboard('{ArrowDown}')

    expect(screen.getByRole('option', { name: '14–16시' })).toHaveFocus()
    await user.keyboard('{ArrowDown}{Enter}')

    expect(handleChange).toHaveBeenCalledWith('17')
    expect(trigger).toHaveFocus()
  })

  it('Escape는 value를 바꾸지 않고 menu를 닫는다', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    render(
      <TimeBandSelect
        label="발견 시간대"
        onValueChange={handleChange}
        options={options}
        value="15"
      />,
    )

    const trigger = screen.getByRole('button', { name: '발견 시간대 14–16시' })
    await user.click(trigger)
    await user.keyboard('{Escape}')

    expect(handleChange).not.toHaveBeenCalled()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('disabled에서는 menu를 열지 않는다', async () => {
    const user = userEvent.setup()
    render(
      <TimeBandSelect
        disabled
        label="발견 시간대"
        onValueChange={vi.fn()}
        options={options}
        value="15"
      />,
    )

    await user.click(screen.getByRole('button', { name: '발견 시간대 14–16시' }))

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
