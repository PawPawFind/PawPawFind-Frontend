import type { ReportPhotoDraft, ReportFeatureInput } from '@/types/report'
import type { CreateMissingAnimalReportRequest, CreateSightingReportRequest } from '@/types/report'

export type ReportFormMode = 'sighting' | 'missing'

export interface SightingReportFormSubmission {
  report: CreateSightingReportRequest
  features: ReportFeatureInput[]
  photos: ReportPhotoDraft[]
}

export interface MissingAnimalReportFormSubmission {
  report: CreateMissingAnimalReportRequest
  features: ReportFeatureInput[]
  photos: ReportPhotoDraft[]
}
