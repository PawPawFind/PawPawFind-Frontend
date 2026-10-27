import { describe, expect, it } from 'vitest'
import { createSightingTitle, hasBatchim } from './createSightingTitle'

describe('createSightingTitle', () => {
  it('장소·색상·크기·종류로 목격 제보 제목을 만든다', () => {
    expect(
      createSightingTitle({
        happenPlace: '서울 마포구 연남동',
        colors: ['검정', '흰색'],
        size: 'MEDIUM',
        species: 'DOG',
      }),
    ).toBe('연남동에서 검정·흰색 중형견을 봤어요')
  })

  it('크기를 모르면 제목에서 생략한다', () => {
    expect(
      createSightingTitle({
        happenPlace: '서울 마포구 연남동',
        colors: ['검정', '흰색'],
        size: null,
        species: 'DOG',
      }),
    ).toBe('연남동에서 검정·흰색 강아지를 봤어요')
  })

  it('마지막 한글 음절의 받침 여부를 구분한다', () => {
    expect(hasBatchim('중형견')).toBe(true)
    expect(hasBatchim('고양이')).toBe(false)
  })
})
