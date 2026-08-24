import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('기본적으로 submit을 발생시키지 않는 버튼이다', async () => {
    const handleSubmit = vi.fn((event: React.FormEvent) => event.preventDefault())
    const user = userEvent.setup()

    render(
      <form onSubmit={handleSubmit}>
        <Button>취소</Button>
      </form>,
    )

    await user.click(screen.getByRole('button', { name: '취소' }))

    expect(handleSubmit).not.toHaveBeenCalled()
  })

  it('native 버튼 속성과 click handler를 전달한다', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(
      <Button aria-label="목록 새로고침" onClick={handleClick} variant="secondary">
        다시 시도
      </Button>,
    )

    const button = screen.getByRole('button', { name: '목록 새로고침' })
    await user.click(button)

    expect(button).toHaveClass('ds-button--secondary', 'ds-button--medium')
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('disabled 상태에서는 click handler를 실행하지 않는다', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(
      <Button disabled onClick={handleClick} size="large">
        제보 등록하기
      </Button>,
    )

    const button = screen.getByRole('button', { name: '제보 등록하기' })
    await user.click(button)

    expect(button).toBeDisabled()
    expect(button).toHaveClass('ds-button--large')
    expect(handleClick).not.toHaveBeenCalled()
  })
})
