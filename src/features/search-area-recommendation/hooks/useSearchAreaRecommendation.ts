import { useMutation } from '@tanstack/react-query'
import { recommendSearchAreas } from '../api/searchAreaRecommendation.api'

// 결과를 캐시하면 안 되는 API라 useQuery가 아니라 useMutation을 씀.
// 버튼을 누를 때마다 서버가 새로 계산해서 돌려준다.
export function useSearchAreaRecommendationMutation() {
  return useMutation({
    mutationFn: (reportId: string) => recommendSearchAreas(reportId),
  })
}
