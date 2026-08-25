import { apiClient } from '@/api/client'
import type { MyReportsApiResponse } from '../types'

export const MY_REPORTS_API_PATH = '/api/reports/me'
export const REPORTS_API_PATH = '/api/reports'

export async function getMyReports(signal?: AbortSignal) {
  const { data } = await apiClient.get<MyReportsApiResponse>(MY_REPORTS_API_PATH, {
    params: { page: 0, size: 20 },
    signal,
  })
  return data
}

export async function deleteMyReport(reportId: number) {
  await apiClient.delete(`${REPORTS_API_PATH}/${reportId}`)
}
