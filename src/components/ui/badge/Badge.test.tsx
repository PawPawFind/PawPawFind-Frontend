import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge } from './Badge'

describe('Badge', () => {
  it('상호작용 없는 보조 텍스트로 렌더링한다', () => {
    render(<Badge className="report-source">목격 제보</Badge>)

    const badge = screen.getByText('목격 제보')
    expect(badge.tagName).toBe('SPAN')
    expect(badge).toHaveClass('ds-badge', 'report-source')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('긴 문구도 그대로 전달한다', () => {
    render(<Badge>보호소에서 안전하게 보호 중인 동물</Badge>)

    expect(screen.getByText('보호소에서 안전하게 보호 중인 동물')).toBeInTheDocument()
  })
})
