import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/api/client'
import { server } from '@/mocks/server'
import { runMissingAnimalMatch } from './missingAnimalSearch.api'

afterEach(() => vi.restoreAllMocks())

describe('missingAnimalSearch API', () => {
  it('run-match 요청에만 45초 타임아웃을 적용한다', async () => {
    const response = { reportId: 207, results: [] }
    const postSpy = vi.spyOn(apiClient, 'post')
    server.use(http.post('*/api/reports/:reportId/run-match', () => HttpResponse.json(response)))

    await expect(runMissingAnimalMatch(207)).resolves.toEqual(response)
    expect(postSpy).toHaveBeenCalledWith('/api/reports/207/run-match', undefined, {
      timeout: 45_000,
    })
  })
})
