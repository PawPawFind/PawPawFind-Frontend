import { useQuery } from '@tanstack/react-query'
import { getShelterNoticeDetail } from '../api/shelterNotices.api'

export function useShelterNoticeDetailQuery(noticeId: string) {
  return useQuery({
    queryKey: ['shelter-notices', 'detail', noticeId],
    queryFn: ({ signal }) => getShelterNoticeDetail(noticeId, signal),
    enabled: noticeId !== '',
  })
}
