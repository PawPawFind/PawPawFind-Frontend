import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createSightingReport } from '../api/sightingReports.api'

export function useCreateSightingReportMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSightingReport,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sighting-reports'] }),
  })
}
