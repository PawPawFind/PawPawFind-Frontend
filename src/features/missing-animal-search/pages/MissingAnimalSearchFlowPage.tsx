import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { routeUrls } from '@/app/router/paths'
import { useCreateMissingAnimalSearchMutation } from '../hooks/useMissingAnimalSearch'
import {
  MissingAnimalSearchFormPage,
  type MissingAnimalSearchFormSubmission,
} from './MissingAnimalSearchFormPage'
import './MissingAnimalSearchFlowPage.css'

export function MissingAnimalSearchFlowPage() {
  const navigate = useNavigate()
  const [previewUrl, setPreviewUrl] = useState('')
  const createSearch = useCreateMissingAnimalSearchMutation()

  useEffect(() => {
    if (!previewUrl) return

    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const startSearch = (submission: MissingAnimalSearchFormSubmission) => {
    const { photos } = submission
    const firstPhoto = photos[0]?.file
    if (firstPhoto) setPreviewUrl(URL.createObjectURL(firstPhoto))

    createSearch.mutate(submission, {
      onSuccess: ({ reportId }) => {
        navigate(routeUrls.missingAnimalSearchResult(String(reportId)), { replace: true })
      },
    })
  }

  if (!previewUrl) return <MissingAnimalSearchFormPage onSubmit={startSearch} />

  return (
    <main className="missing-animal-analysis-page">
      <section aria-labelledby="analysis-title" className="missing-animal-analysis">
        <h1 id="analysis-title">비슷한 동물을 찾고 있어요</h1>
        <div className="missing-animal-analysis__photo">
          <img alt="찾고 있는 실종 동물" src={previewUrl} />
        </div>
        <div
          aria-label="유사 동물 검색 중"
          aria-valuemax={100}
          aria-valuemin={0}
          className="missing-animal-analysis__progress"
          role="progressbar"
        >
          <span />
        </div>
        <p>전국 보호소와 목격 제보에서 비슷한 동물을 확인하고 있어요.</p>
        {createSearch.isError && (
          <div className="missing-animal-analysis__error" role="alert">
            <p>비슷한 동물을 찾지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
            <button onClick={() => createSearch.mutate(createSearch.variables!)} type="button">
              다시 시도
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
