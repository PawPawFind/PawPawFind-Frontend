import axios from 'axios'
import { getAnimalSpeciesLabel } from '@/api/animalLabels'
import { apiClient } from '@/api/client'
import type { AnimalApiResponse } from '@/types/animal'
import type { ShelterNoticeDetail } from '../types'

export const ANIMALS_API_PATH = '/api/animals'

const sexLabels: Record<string, string> = { M: '수컷', F: '암컷', Q: '미상' }
const neuterLabels: Record<string, string> = { Y: '완료', N: '안 됨', U: '미상' }

function formatDate(value: string | null) {
  if (!value) return '정보 없음'
  return /^\d{8}$/.test(value)
    ? value.replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3')
    : value.replace(/-/g, '.')
}

function valueOrFallback(value: string | null) {
  return value?.trim() || '정보 없음'
}

export function toShelterNoticeDetail(animal: AnimalApiResponse): ShelterNoticeDetail {
  const species = getAnimalSpeciesLabel(animal.upKindNm)
  const breed = valueOrFallback(animal.kindNm || animal.kindFullNm)
  const color = valueOrFallback(animal.colorCd)
  const sex = animal.sexCd ? (sexLabels[animal.sexCd] ?? animal.sexCd) : '정보 없음'

  return {
    id: animal.desertionNo,
    title: `${breed} · ${color} · ${sex} 보호 중`,
    status: valueOrFallback(animal.processState),
    photos: [animal.popfile1, animal.popfile2].filter((photo): photo is string => Boolean(photo)),
    details: [
      { label: '보호 ID', value: animal.desertionNo },
      { label: '보호 상태', value: valueOrFallback(animal.processState) },
      { label: '공고번호', value: valueOrFallback(animal.noticeNo) },
      { label: '동물 종류', value: species },
      { label: '품종', value: breed },
      { label: '색상', value: color },
      { label: '나이', value: valueOrFallback(animal.age) },
      { label: '체중', value: valueOrFallback(animal.weight) },
      { label: '성별', value: sex },
      {
        label: '중성화',
        value: animal.neuterYn ? (neuterLabels[animal.neuterYn] ?? animal.neuterYn) : '정보 없음',
      },
      { label: '발견 장소', value: valueOrFallback(animal.happenPlace) },
      { label: '발견 날짜', value: formatDate(animal.happenDt) },
      {
        label: '공고 기간',
        value: `${formatDate(animal.noticeSdt)} – ${formatDate(animal.noticeEdt)}`,
      },
      { label: '특징', value: valueOrFallback(animal.specialMark) },
    ],
    shelterName: valueOrFallback(animal.careNm),
    shelterAddress: valueOrFallback(animal.careAddr),
    shelterPhone: valueOrFallback(animal.careTel),
  }
}

export async function getShelterNoticeDetail(noticeId: string, signal?: AbortSignal) {
  try {
    const { data } = await apiClient.get<AnimalApiResponse>(
      `${ANIMALS_API_PATH}/${encodeURIComponent(noticeId)}`,
      { signal },
    )
    return toShelterNoticeDetail(data)
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return null
    throw error
  }
}
