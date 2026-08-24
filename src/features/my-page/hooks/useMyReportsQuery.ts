import { useQuery } from '@tanstack/react-query'
import { getMyReports } from '../api/myPage.api'
import { myReportsQueryKey } from './queryKeys'

export function useMyReportsQuery() {
  return useQuery({
    queryKey: myReportsQueryKey,
    queryFn: ({ signal }) => getMyReports(signal),
  })
}
