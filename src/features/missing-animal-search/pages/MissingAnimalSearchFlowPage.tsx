import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { getUncleanedReportId } from '@/api/reportCreation.api'
import { routeUrls } from '@/app/router/paths'
import { useCleanupCreatedReportMutation } from '@/hooks/useCleanupCreatedReportMutation'
import {
  useCreateMissingAnimalSearchMutation,
  useRunMissingAnimalMatchMutation,
} from '../hooks/useMissingAnimalSearch'
import {
  MissingAnimalSearchFormPage,
  type MissingAnimalSearchFormSubmission,
} from './MissingAnimalSearchFormPage'
import './MissingAnimalSearchFlowPage.css'

export function MissingAnimalSearchFlowPage() {
  const navigate = useNavigate()
  const [previewUrl, setPreviewUrl] = useState('')
  const [createdReportId, setCreatedReportId] = useState<number | null>(null)
  const [uncleanedReportId, setUncleanedReportId] = useState<number | null>(null)
  const createReport = useCreateMissingAnimalSearchMutation()
  const runMatch = useRunMissingAnimalMatchMutation()
  const cleanupReport = useCleanupCreatedReportMutation()
  const isCleaningUp = cleanupReport.isPending
  const hasError =
    !isCleaningUp && (createReport.isError || runMatch.isError || cleanupReport.isError)

  useEffect(() => {
    if (!previewUrl) return

    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const requestMatch = (reportId: number) => {
    runMatch.mutate(reportId, {
      onSuccess: () => {
        navigate(routeUrls.missingAnimalSearchResult(String(reportId)), { replace: true })
      },
    })
  }

  const createMissingReport = (submission: MissingAnimalSearchFormSubmission) => {
    createReport.mutate(submission, {
      onSuccess: ({ reportId }) => {
        setCreatedReportId(reportId)
        requestMatch(reportId)
      },
      onError: (error) => {
        const reportId = getUncleanedReportId(error)
        if (reportId !== null) setUncleanedReportId(reportId)
      },
    })
  }

  const startSearch = (submission: MissingAnimalSearchFormSubmission) => {
    const { photos } = submission
    const firstPhoto = photos[0]?.file
    if (firstPhoto) setPreviewUrl(URL.createObjectURL(firstPhoto))

    createMissingReport(submission)
  }

  const retrySearch = () => {
    if (uncleanedReportId !== null) {
      const submission = createReport.variables
      if (!submission) return

      cleanupReport.mutate(uncleanedReportId, {
        onSuccess: () => {
          setUncleanedReportId(null)
          createMissingReport(submission)
        },
      })
      return
    }

    if (createdReportId !== null) {
      requestMatch(createdReportId)
      return
    }

    if (createReport.variables) createMissingReport(createReport.variables)
  }

  if (!previewUrl) return <MissingAnimalSearchFormPage onSubmit={startSearch} />

  return (
    <main className="missing-animal-analysis-page">
      <section aria-labelledby="analysis-title" className="missing-animal-analysis">
        <h1 id="analysis-title">
          {isCleaningUp
            ? '이전 제보를 정리하고 있어요'
            : hasError
              ? uncleanedReportId !== null
                ? '이전 제보를 정리하지 못했어요'
                : createReport.isError
                  ? '제보를 등록하지 못했어요'
                  : '비슷한 동물 검색을 완료하지 못했어요'
              : '비슷한 동물을 찾고 있어요'}
        </h1>
        <div className="missing-animal-analysis__photo">
          <img alt="찾고 있는 실종 동물" src={previewUrl} />
        </div>
        {hasError ? (
          <div className="missing-animal-analysis__error" role="alert">
            <p>
              {uncleanedReportId !== null
                ? '중복 등록을 막기 위해 새 제보를 만들지 않았습니다. 이전 제보 정리를 다시 시도해 주세요.'
                : createReport.isError
                  ? '제보 등록을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.'
                  : '비슷한 동물을 찾지 못했습니다. 잠시 후 다시 시도해 주세요.'}
            </p>
            <button onClick={retrySearch} type="button">
              다시 시도
            </button>
          </div>
        ) : (
          <>
            <div
              aria-label={isCleaningUp ? '이전 제보 정리 중' : '유사 동물 검색 중'}
              aria-valuemax={100}
              aria-valuemin={0}
              className="missing-animal-analysis__progress"
              role="progressbar"
            >
              <span />
            </div>
            <p>
              {isCleaningUp
                ? '중복 등록을 막기 위해 이전 제보부터 안전하게 정리하고 있어요.'
                : '전국 보호소와 목격 제보에서 비슷한 동물을 확인하고 있어요.'}
            </p>
          </>
        )}
      </section>
    </main>
  )
}
