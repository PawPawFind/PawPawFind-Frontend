import type { ReportImageAnalyzer } from './reportImageAnalysis.types'

const MOCK_ANALYSIS_DELAY_MS = 800

function waitForMockAnalysis(signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timerId = window.setTimeout(resolve, MOCK_ANALYSIS_DELAY_MS)

    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timerId)
        reject(new DOMException('분석이 취소되었습니다.', 'AbortError'))
      },
      { once: true },
    )
  })
}

export const mockReportImageAnalyzer: ReportImageAnalyzer = async (photo, { signal }) => {
  await waitForMockAnalysis(signal)

  if (photo.name.toLowerCase().includes('fail')) {
    throw new Error('mock 이미지 분석 실패')
  }

  return {
    requestId: `mock-${photo.name}-${photo.lastModified}`,
    species: 'DOG',
    features: [
      { category: '털색', keyword: '검정' },
      { category: '털색', keyword: '흰색' },
      { category: '무늬', keyword: '얼룩무늬' },
      { category: '털길이', keyword: '김' },
      { category: '귀', keyword: '쫑긋' },
      { category: '꼬리', keyword: '김' },
      { category: '눈/얼굴', keyword: '주둥이 흰 털' },
      { category: '착용 중', keyword: '목줄 있음' },
    ],
    breedCandidates: [
      {
        id: 'dog:border_collie',
        labelKo: '보더콜리',
        labelEn: 'Border Collie',
        rank: 1,
      },
      { id: 'dog:collie', labelKo: '콜리', labelEn: 'Collie', rank: 2 },
      {
        id: 'dog:shetland_sheepdog',
        labelKo: '셔틀랜드 쉽독',
        labelEn: 'Shetland Sheepdog',
        rank: 3,
      },
    ],
    warnings: [],
  }
}
