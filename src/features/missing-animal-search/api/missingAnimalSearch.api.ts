import { apiClient } from '@/api/client'
import { getAnimalSpeciesLabel } from '@/api/animalLabels'
import { createReportWithAssets } from '@/api/reportCreation.api'
import type { ReportListApiItem } from '@/features/sighting-reports/types'
import type { AnimalApiResponse } from '@/types/animal'
import type {
  MatchCandidateApiItem,
  MatchQueryApiResponse,
  MissingAnimalCandidate,
  MissingAnimalSearchSubmission,
} from '../types'

const ANIMALS_API_PATH = '/api/animals'
const REPORTS_API_PATH = '/api/reports'
const speciesLabels: Record<string, string> = { DOG: '강아지', CAT: '고양이' }
const sizeLabels: Record<string, string> = { SMALL: '소형', MEDIUM: '중형', LARGE: '대형' }

function matchApiPath(reportId: string | number) {
  return `${REPORTS_API_PATH}/${encodeURIComponent(String(reportId))}/matches`
}

function runMatchApiPath(reportId: string | number) {
  return `${REPORTS_API_PATH}/${encodeURIComponent(String(reportId))}/run-match`
}

function formatDate(value: string | null) {
  if (!value) return '날짜 정보 없음'
  if (/^\d{8}$/.test(value)) return value.replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3')
  return value.replace(/-/g, '.')
}

function toSimilarity(candidate: MatchCandidateApiItem) {
  const score = candidate.rankingScore ?? candidate.visualScore
  const percentage = score <= 1 ? score * 100 : score
  return Math.round(Math.max(0, Math.min(100, percentage)))
}

function getReportSummary(report: ReportListApiItem) {
  if (report.title?.trim()) return report.title
  return [speciesLabels[report.species] ?? report.species, sizeLabels[report.size] ?? report.size]
    .filter(Boolean)
    .join(' · ')
}

async function enrichCandidate(
  candidate: MatchCandidateApiItem,
  signal?: AbortSignal,
): Promise<MissingAnimalCandidate | null> {
  if (candidate.candidateType === 'SHELTER' && candidate.desertionNo) {
    const { data: animal } = await apiClient.get<AnimalApiResponse>(
      `${ANIMALS_API_PATH}/${encodeURIComponent(candidate.desertionNo)}`,
      { signal },
    )
    return {
      id: `shelter-${candidate.desertionNo}`,
      targetId: candidate.desertionNo,
      imageUrl: candidate.imageUrl || animal.popfile1 || '',
      similarity: toSimilarity(candidate),
      summary: [getAnimalSpeciesLabel(animal.upKindNm), animal.kindNm, animal.colorCd]
        .filter(Boolean)
        .join(' · '),
      area: animal.happenPlace || animal.careAddr || '장소 정보 없음',
      date: formatDate(animal.happenDt),
      source: 'SHELTER',
    }
  }

  if (candidate.candidateType === 'REPORT' && candidate.candidateReportId) {
    const { data: report } = await apiClient.get<ReportListApiItem>(
      `${REPORTS_API_PATH}/${candidate.candidateReportId}`,
      { signal },
    )
    return {
      id: `report-${candidate.candidateReportId}`,
      targetId: String(candidate.candidateReportId),
      imageUrl: candidate.imageUrl || report.thumbnailUrl || '',
      similarity: toSimilarity(candidate),
      summary: getReportSummary(report),
      area: report.happenPlace,
      date: formatDate(report.eventDate),
      source: report.reportType === 'LOST' ? 'LOST' : 'SIGHTING',
    }
  }

  return null
}

export async function createMissingAnimalReport(submission: MissingAnimalSearchSubmission) {
  return createReportWithAssets(submission, { speciesFormat: 'KOREAN' })
}

export async function runMissingAnimalMatch(reportId: number) {
  const { data } = await apiClient.post<MatchQueryApiResponse>(runMatchApiPath(reportId))
  return data
}

export async function getMissingAnimalSearchResults(reportId: string, signal?: AbortSignal) {
  const { data } = await apiClient.get<MatchQueryApiResponse>(matchApiPath(reportId), {
    params: { limit: 20 },
    signal,
  })
  const settledCandidates = await Promise.allSettled(
    data.results.map((candidate) => enrichCandidate(candidate, signal)),
  )

  return settledCandidates.flatMap((result) =>
    result.status === 'fulfilled' && result.value ? [result.value] : [],
  )
}
