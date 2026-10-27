import {
  PhotoFirstReportForm,
  type MissingAnimalReportFormSubmission,
  type ReportImageAnalyzer,
} from '@/features/report-form'

interface MissingAnimalSearchFormPageProps {
  analyzeImage?: ReportImageAnalyzer
  onSubmit?: (submission: MissingAnimalReportFormSubmission) => void
}

export function MissingAnimalSearchFormPage(props: MissingAnimalSearchFormPageProps) {
  return <PhotoFirstReportForm mode="missing" {...props} />
}

export type MissingAnimalSearchFormSubmission = MissingAnimalReportFormSubmission
export type { MissingAnimalSearchFormPageProps }
