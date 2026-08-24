import { useMutation, useQuery } from '@tanstack/react-query'
import {
  createMissingAnimalSearch,
  getMissingAnimalSearchResults,
} from '../api/missingAnimalSearch.api'

export function useCreateMissingAnimalSearchMutation() {
  return useMutation({ mutationFn: createMissingAnimalSearch })
}

export function useMissingAnimalSearchResultsQuery(reportId: string | undefined) {
  return useQuery({
    queryKey: ['missing-animal-search', 'results', reportId],
    queryFn: ({ signal }) => getMissingAnimalSearchResults(reportId!, signal),
    enabled: Boolean(reportId),
  })
}
