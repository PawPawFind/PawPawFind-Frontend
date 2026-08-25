import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ImageViewer } from './ImageViewer'

describe('ImageViewer', () => {
  it('확대 버튼으로 modal을 열고 닫은 뒤 버튼으로 포커스를 돌린다', async () => {
    const user = userEvent.setup()
    render(<ImageViewer alt="강아지 사진" src="/dog.jpg" triggerLabel="강아지 사진 확대" />)

    const trigger = screen.getByRole('button', { name: '강아지 사진 확대' })
    await user.click(trigger)

    const dialog = screen.getByRole('dialog', { name: '강아지 사진' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(within(dialog).getByRole('img', { name: '강아지 사진' })).toHaveAttribute(
      'src',
      '/dog.jpg',
    )

    await user.click(screen.getByRole('button', { name: '확대 사진 닫기' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('Esc 취소 이벤트로 닫는다', async () => {
    const user = userEvent.setup()
    render(<ImageViewer alt="고양이 사진" src="/cat.jpg" triggerLabel="고양이 사진 확대" />)

    await user.click(screen.getByRole('button', { name: '고양이 사진 확대' }))
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { bubbles: true, cancelable: true }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
