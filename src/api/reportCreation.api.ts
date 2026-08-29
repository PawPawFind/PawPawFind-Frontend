import { apiClient } from './client'
import type {
  CreateReportFeatureRequest,
  CreateReportPhotoRequest,
  CreateReportRequest,
  PresignUploadRequest,
  PresignUploadResponse,
  ReportFeatureInput,
  ReportPhotoDraft,
} from '@/types/report'

export const REPORTS_API_PATH = '/api/reports'
export const REPORT_PHOTOS_API_PATH = '/api/report-photos'
export const REPORT_FEATURES_API_PATH = '/api/report-features'
export const PRESIGN_UPLOAD_API_PATH = '/api/uploads/presign'

export interface CreateReportSubmission {
  report: CreateReportRequest
  features: ReportFeatureInput[]
  photos: ReportPhotoDraft[]
}

interface CreatedReportResponse {
  reportId: number
}

interface CreateReportOptions {
  speciesFormat?: 'CODE' | 'KOREAN'
}

const speciesKoreanLabels = { DOG: '강아지', CAT: '고양이' } as const

export class ReportAssetCreationError extends Error {
  readonly reportId: number
  readonly cleanupFailed: boolean

  constructor(reportId: number, cleanupFailed: boolean) {
    super(
      cleanupFailed
        ? '제보의 사진 또는 특징 등록에 실패했고 생성된 제보를 정리하지 못했습니다.'
        : '제보의 사진 또는 특징 등록에 실패했습니다.',
    )
    this.name = 'ReportAssetCreationError'
    this.reportId = reportId
    this.cleanupFailed = cleanupFailed
  }
}

async function uploadReportPhoto(reportId: number, photo: ReportPhotoDraft) {
  const presignRequest: PresignUploadRequest = {
    filename: photo.file.name,
    contentType: photo.file.type,
  }
  const { data: presigned } = await apiClient.post<PresignUploadResponse>(
    PRESIGN_UPLOAD_API_PATH,
    presignRequest,
  )

  const uploadResponse = await fetch(presigned.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': photo.file.type },
    body: photo.file,
  })
  if (!uploadResponse.ok) throw new Error('사진 업로드에 실패했습니다.')

  const photoRequest: CreateReportPhotoRequest = {
    reportId,
    photoUrl: presigned.photoUrl,
    sortOrder: photo.sortOrder,
  }
  await apiClient.post(REPORT_PHOTOS_API_PATH, photoRequest)
}

export async function createReportWithAssets(
  submission: CreateReportSubmission,
  options: CreateReportOptions = {},
) {
  const reportRequest = {
    ...submission.report,
    species:
      options.speciesFormat === 'KOREAN'
        ? speciesKoreanLabels[submission.report.species]
        : submission.report.species,
  }
  const { data: createdReport } = await apiClient.post<CreatedReportResponse>(
    REPORTS_API_PATH,
    reportRequest,
  )

  const assetResults = await Promise.allSettled([
    ...submission.photos.map((photo) => uploadReportPhoto(createdReport.reportId, photo)),
    ...submission.features.map((feature) => {
      const request: CreateReportFeatureRequest = {
        reportId: createdReport.reportId,
        ...feature,
      }
      return apiClient.post(REPORT_FEATURES_API_PATH, request)
    }),
  ])

  if (assetResults.some((result) => result.status === 'rejected')) {
    let cleanupFailed = false

    try {
      await apiClient.delete(`${REPORTS_API_PATH}/${createdReport.reportId}`)
    } catch {
      cleanupFailed = true
    }

    throw new ReportAssetCreationError(createdReport.reportId, cleanupFailed)
  }

  return createdReport
}
