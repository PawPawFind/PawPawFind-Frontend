import { useState } from 'react'
import { useNavigate } from 'react-router'
import { getUncleanedReportId } from '@/api/reportCreation.api'
import { SightingReportFormPage } from '@/features/sighting-reports'
import { useCreateSightingReportMutation } from '@/features/sighting-reports/hooks/useCreateSightingReportMutation'
import { useCleanupCreatedReportMutation } from '@/hooks/useCleanupCreatedReportMutation'
import type { SightingReportFormSubmission } from '@/features/sighting-reports/pages/SightingReportFormPage'
import { routeUrls } from '../paths'

export function SightingReportFormRoute() {
  const navigate = useNavigate()
  const [uncleanedReportId, setUncleanedReportId] = useState<number | null>(null)
  const createReport = useCreateSightingReportMutation()
  const cleanupReport = useCleanupCreatedReportMutation()

  const submitReport = (submission: SightingReportFormSubmission) => {
    createReport.mutate(submission, {
      onSuccess: () => navigate(routeUrls.sightingReports(), { replace: true }),
      onError: (error) => {
        const reportId = getUncleanedReportId(error)
        if (reportId !== null) setUncleanedReportId(reportId)
      },
    })
  }

  const handleSubmit = (submission: SightingReportFormSubmission) => {
    if (uncleanedReportId === null) {
      submitReport(submission)
      return
    }

    cleanupReport.mutate(uncleanedReportId, {
      onSuccess: () => {
        setUncleanedReportId(null)
        submitReport(submission)
      },
    })
  }

  const errorMessage =
    uncleanedReportId !== null
      ? cleanupReport.isError
        ? '이전 제보를 정리하지 못해 새 제보를 만들지 않았습니다. 다시 시도해 주세요.'
        : '사진 또는 특징 등록에 실패한 이전 제보를 정리하지 못했습니다. 다시 시도하면 이전 제보를 먼저 정리합니다.'
      : createReport.isError
        ? '제보를 등록하지 못했습니다. 다시 시도해 주세요.'
        : undefined

  return (
    <SightingReportFormPage
      errorMessage={errorMessage}
      isSubmitting={createReport.isPending || cleanupReport.isPending}
      onSubmit={handleSubmit}
    />
  )
}
