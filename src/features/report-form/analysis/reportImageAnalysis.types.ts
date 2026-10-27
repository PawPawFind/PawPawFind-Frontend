import type { Species } from '@/types/domain'
import type { ReportFeatureInput } from '@/types/report'

export interface BreedCandidate {
  id: string
  labelKo: string
  labelEn: string
  rank: number
}

export interface ReportImageAnalysisWarning {
  field: string
  message: string
}

export interface ReportImageAnalysisResult {
  requestId: string
  species: Species | null
  features: ReportFeatureInput[]
  breedCandidates: BreedCandidate[]
  warnings: ReportImageAnalysisWarning[]
}

export interface ReportImageAnalyzerOptions {
  signal: AbortSignal
}

export type ReportImageAnalyzer = (
  photo: File,
  options: ReportImageAnalyzerOptions,
) => Promise<ReportImageAnalysisResult>
