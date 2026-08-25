import { useNavigate } from 'react-router'
import { SightingReportFormPage } from '@/features/sighting-reports'
import { useCreateSightingReportMutation } from '@/features/sighting-reports/hooks/useCreateSightingReportMutation'
import { routeUrls } from '../paths'

export function SightingReportFormRoute() {
  const navigate = useNavigate()
  const createReport = useCreateSightingReportMutation()

  return (
    <SightingReportFormPage
      errorMessage={
        createReport.isError ? '제보를 등록하지 못했습니다. 다시 시도해 주세요.' : undefined
      }
      isSubmitting={createReport.isPending}
      onSubmit={(submission) =>
        createReport.mutate(submission, {
          onSuccess: () => navigate(routeUrls.sightingReports(), { replace: true }),
        })
      }
    />
  )
}
