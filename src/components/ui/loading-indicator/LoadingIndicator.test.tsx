import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LoadingIndicator } from './LoadingIndicator'

describe('LoadingIndicator', () => {
  it('로딩 문구를 status로 제공하고 애니메이션을 장식으로 숨긴다', () => {
    render(<LoadingIndicator label="데이터를 불러오는 중입니다." />)

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('데이터를 불러오는 중입니다.')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status.querySelector('.ds-loading-indicator__animation')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  it('작은 크기와 추가 클래스를 적용한다', () => {
    render(<LoadingIndicator className="example" label="처리 중" size="small" />)
    expect(screen.getByRole('status')).toHaveClass('ds-loading-indicator--small', 'example')
  })
})
