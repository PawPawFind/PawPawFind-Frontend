import { useMutation } from '@tanstack/react-query'
import { deleteCreatedReport } from '@/api/reportCreation.api'

export function useCleanupCreatedReportMutation() {
  return useMutation({ mutationFn: deleteCreatedReport })
}
