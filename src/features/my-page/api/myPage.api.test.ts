import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/mocks/server'
import { deleteMyReport, REPORTS_API_PATH } from './myPage.api'

describe('myPage API', () => {
  it('인증 헤더와 reportId로 내 글 삭제를 요청한다', async () => {
    localStorage.setItem('pawpawfind.accessToken', 'delete-access-token')
    let authorization: string | null = null

    server.use(
      http.delete(`*${REPORTS_API_PATH}/37`, ({ request }) => {
        authorization = request.headers.get('Authorization')
        return new HttpResponse(null, { status: 200 })
      }),
    )

    await expect(deleteMyReport(37)).resolves.toBeUndefined()
    expect(authorization).toBe('Bearer delete-access-token')
  })

  it('삭제 실패를 호출자에게 전달한다', async () => {
    server.use(
      http.delete(`*${REPORTS_API_PATH}/37`, () =>
        HttpResponse.json({ message: '삭제할 수 없습니다.' }, { status: 403 }),
      ),
    )

    await expect(deleteMyReport(37)).rejects.toBeDefined()
  })
})
