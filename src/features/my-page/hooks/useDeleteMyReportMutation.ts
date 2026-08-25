import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteMyReport } from '../api/myPage.api'
import type { MyReportsApiResponse } from '../types'
import { myReportsQueryKey } from './queryKeys'

export function useDeleteMyReportMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMyReport,
    onSuccess: (_, deletedReportId) => {
      queryClient.setQueryData<MyReportsApiResponse>(myReportsQueryKey, (current) => {
        if (!current) return current

        const content = current.content.filter((report) => report.reportId !== deletedReportId)
        const removedCount = current.content.length - content.length
        return {
          ...current,
          content,
          totalElements: Math.max(0, current.totalElements - removedCount),
        }
      })
      void queryClient.invalidateQueries({ queryKey: myReportsQueryKey })
      void queryClient.invalidateQueries({ queryKey: ['sighting-reports'] })
    },
  })
}
