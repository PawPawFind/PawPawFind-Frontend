import type { CreateReportSubmission } from '@/api/reportCreation.api'
import type { CreateMissingAnimalReportRequest } from '@/types/report'

export type MissingAnimalSearchSubmission = Omit<CreateReportSubmission, 'report'> & {
  report: CreateMissingAnimalReportRequest
}

export interface MatchCandidateApiItem {
  rank: number
  candidateType: 'SHELTER' | 'REPORT'
  desertionNo: string | null
  candidateReportId: number | null
  visualScore: number
  rankingScore: number | null
  tagScore: number | null
  textScore: number | null
  phashDistance: number | null
  nearDuplicate: boolean | null
  matchedTags: Record<string, unknown> | null
  conflictingTags: Record<string, unknown> | null
  galleryId: string | null
  imageUrl: string
}

export interface MatchQueryApiResponse {
  matchRunId: number | null
  reportId: number
  modelVersion: string | null
  rerankVersion: string | null
  decision: string | null
  status: string | null
  createdAt: string | null
  results: MatchCandidateApiItem[]
}

export interface MissingAnimalCandidate {
  id: string
  targetId: string
  imageUrl: string
  similarity: number
  summary: string
  area: string
  date: string
  source: 'SHELTER' | 'SIGHTING' | 'LOST'
}
