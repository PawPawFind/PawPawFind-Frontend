import { useMutation, useQuery } from '@tanstack/react-query'
import {
  createMissingAnimalReport,
  getMissingAnimalSearchResults,
  runMissingAnimalMatch,
} from '../api/missingAnimalSearch.api'

export function useCreateMissingAnimalSearchMutation() {
  return useMutation({ mutationFn: createMissingAnimalReport })
}

export function useRunMissingAnimalMatchMutation() {
  return useMutation({ mutationFn: runMissingAnimalMatch })
}

export function useMissingAnimalSearchResultsQuery(reportId: string | undefined) {
  return useQuery({
    queryKey: ['missing-animal-search', 'results', reportId],
    queryFn: ({ signal }) => getMissingAnimalSearchResults(reportId!, signal),
    enabled: Boolean(reportId),
  })
}
