import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SightingReportListItem } from './SightingReportListItem'

const report = {
  id: 'p1',
  title: '믹스견 · 갈색 · 중형',
  speciesLabel: '강아지',
  areaText: '서울 마포구 연남동 · 0.9km',
  dateText: '2026.08.11',
  tags: ['목줄 있음', '귀 접힘'],
}

describe('SightingReportListItem', () => {
  it('제보 요약과 특징을 article로 표시한다', () => {
    render(<SightingReportListItem report={report} />)
    expect(screen.getByRole('article')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: report.title })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: '특징' })).toHaveTextContent('목줄 있음')
  })

  it('선택 계약이 있어도 article 의미를 유지하고 별도 버튼을 제공한다', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<SightingReportListItem onSelect={onSelect} report={report} />)

    const article = screen.getByRole('article')
    const button = screen.getByRole('button', { name: `${report.title} 상세 보기` })

    expect(screen.getByRole('heading', { name: report.title })).toBeInTheDocument()
    expect(article).toContainElement(button)

    await user.click(button)
    button.focus()
    await user.keyboard('{Enter}')
    await user.keyboard(' ')

    expect(onSelect).toHaveBeenCalledTimes(3)
    expect(onSelect).toHaveBeenNthCalledWith(1, 'p1')
  })

  it('썸네일을 표시하고 이미지 로드가 실패하면 대체 아이콘을 보여준다', () => {
    const { container } = render(
      <SightingReportListItem report={{ ...report, thumbnailUrl: '/report-thumbnail.jpg' }} />,
    )
    const image = container.querySelector('img')

    expect(image).toHaveAttribute('src', '/report-thumbnail.jpg')
    fireEvent.error(image!)
    expect(container.querySelector('img')).not.toBeInTheDocument()
    expect(container.querySelector('.sighting-report-list-item__thumbnail')).toHaveTextContent('🐾')
  })
})
