import {
  PhotoFirstReportForm,
  type ReportImageAnalyzer,
  type SightingReportFormSubmission as SharedSightingReportFormSubmission,
} from '@/features/report-form'

interface SightingReportFormPageProps {
  analyzeImage?: ReportImageAnalyzer
  errorMessage?: string
  isSubmitting?: boolean
  onSubmit?: (submission: SharedSightingReportFormSubmission) => void
}

export function SightingReportFormPage(props: SightingReportFormPageProps) {
  return <PhotoFirstReportForm mode="sighting" {...props} />
}

export type SightingReportFormSubmission = SharedSightingReportFormSubmission
export type { SightingReportFormPageProps }
