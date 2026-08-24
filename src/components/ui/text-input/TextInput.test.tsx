import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { TextInput } from './TextInput'

describe('TextInput', () => {
  it('생성한 id로 label과 input을 연결하고 native 속성을 전달한다', async () => {
    const user = userEvent.setup()
    render(
      <TextInput label="제보 제목" maxLength={30} placeholder="제목을 입력해 주세요" required />,
    )

    const input = screen.getByRole('textbox', { name: '제보 제목' })
    await user.type(input, '연남동 갈색 강아지')

    expect(input).toHaveValue('연남동 갈색 강아지')
    expect(input).toHaveAttribute('maxlength', '30')
    expect(input).toBeRequired()
    expect(input.id).not.toBe('')
  })

  it('사용자 지정 id와 help text를 연결한다', () => {
    render(<TextInput description="다른 사용자에게 공개됩니다." id="nickname" label="닉네임" />)

    const input = screen.getByRole('textbox', { name: '닉네임' })
    expect(input).toHaveAttribute('id', 'nickname')
    expect(input).toHaveAccessibleDescription('다른 사용자에게 공개됩니다.')
  })

  it('오류를 invalid 상태와 접근 가능한 설명으로 전달한다', () => {
    render(<TextInput errorMessage="제목을 입력해 주세요." label="제보 제목" />)

    const input = screen.getByRole('textbox', { name: '제보 제목' })
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('제목을 입력해 주세요.')
  })

  it('disabled 상태를 native input에 전달한다', () => {
    render(<TextInput disabled label="닉네임" value="포포지기" readOnly />)
    expect(screen.getByRole('textbox', { name: '닉네임' })).toBeDisabled()
  })

  it('키보드로 focus할 수 있다', async () => {
    const user = userEvent.setup()
    render(<TextInput label="제보 제목" />)

    await user.tab()

    expect(screen.getByRole('textbox', { name: '제보 제목' })).toHaveFocus()
  })
})
