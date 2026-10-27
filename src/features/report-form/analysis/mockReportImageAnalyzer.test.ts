import { describe, expect, it } from 'vitest'
import { mockReportImageAnalyzer } from './mockReportImageAnalyzer'

describe('mockReportImageAnalyzer', () => {
  it('사진에서 UI 검토용 제안값을 반환한다', async () => {
    const photo = new File(['photo'], 'dog.jpg', { type: 'image/jpeg', lastModified: 1 })
    const result = await mockReportImageAnalyzer(photo, {
      signal: new AbortController().signal,
    })

    expect(result.species).toBe('DOG')
    expect(result.features).toContainEqual({ category: '털색', keyword: '검정' })
    expect(result.breedCandidates).toHaveLength(3)
  })

  it('파일명에 fail이 있으면 직접 입력 모드 확인용 오류를 반환한다', async () => {
    const photo = new File(['photo'], 'analysis-fail.jpg', { type: 'image/jpeg' })

    await expect(
      mockReportImageAnalyzer(photo, { signal: new AbortController().signal }),
    ).rejects.toThrow('mock 이미지 분석 실패')
  })
})
