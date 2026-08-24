import { useQuery } from '@tanstack/react-query'
import { getSightingReport, getSightingReports } from '../api/sightingReports.api'

export const sightingReportKeys = {
  all: ['sighting-reports'] as const,
  list: (page: number, size: number) => [...sightingReportKeys.all, 'list', page, size] as const,
  detail: (sightingId: string) => [...sightingReportKeys.all, 'detail', sightingId] as const,
}

export function useSightingReportQuery(sightingId: string | undefined) {
  return useQuery({
    enabled: Boolean(sightingId),
    queryKey: sightingReportKeys.detail(sightingId ?? ''),
    queryFn: ({ signal }) => getSightingReport(sightingId ?? '', signal),
  })
}

export function useSightingReportsQuery(page: number, size: number) {
  return useQuery({
    queryKey: sightingReportKeys.list(page, size),
    queryFn: ({ signal }) => getSightingReports(page, size, signal),
  })
}
