import { http, HttpResponse } from 'msw'

export const authHandlers = [
  http.post('*/api/auth/kakao', async ({ request }) => {
    const body = (await request.json()) as { code?: string }

    if (!body.code) return HttpResponse.json({ message: 'code가 필요합니다.' }, { status: 400 })

    return HttpResponse.json({
      accessToken: 'mock-access-token',
      userId: 1,
      nickname: '포포',
      provider: 'KAKAO',
    })
  }),
]
