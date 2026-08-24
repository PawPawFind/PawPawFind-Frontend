import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { describe, expect, it, vi } from 'vitest'
import { renderWithQueryClient } from '@/test/render'
import { appRoutes } from './routes'

function renderRoute(initialEntry: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [initialEntry] })
  renderWithQueryClient(<RouterProvider router={router} />)
  return router
}

describe('appRoutes', () => {
  it('홈 경로를 렌더링한다', () => {
    renderRoute('/')
    expect(screen.getByRole('heading', { name: /잃어버린 반려동물을/ })).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toHaveTextContent('국가동물보호정보시스템 공공데이터')
    expect(screen.queryByRole('link', { name: '마이페이지' })).not.toBeInTheDocument()
  })

  it('카카오 인가 코드를 백엔드 인증 API와 교환한다', async () => {
    sessionStorage.setItem('pawpawfind.kakaoOAuthState', 'oauth-state')
    const router = renderRoute('/auth/kakao/callback?code=kakao-code&state=oauth-state')

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/')
      expect(localStorage.getItem('pawpawfind.accessToken')).toBe('mock-access-token')
    })
    expect(await screen.findByRole('heading', { name: /잃어버린 반려동물을/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '마이페이지' })).toBeInTheDocument()
  })

  it('실종 동물 찾기 로그인 후 원래 목적지로 이동한다', async () => {
    sessionStorage.setItem('pawpawfind.kakaoOAuthState', 'oauth-state')
    sessionStorage.setItem('pawpawfind.kakaoOAuthReturnTo', '/find/new')
    const router = renderRoute('/auth/kakao/callback?code=kakao-code&state=oauth-state')

    await waitFor(() => expect(router.state.location.pathname).toBe('/find/new'))
    expect(
      await screen.findByRole('heading', { name: '잃어버린 아이의 정보를 알려주세요' }),
    ).toBeVisible()
    expect(sessionStorage.getItem('pawpawfind.kakaoOAuthReturnTo')).toBeNull()
  })

  it('미인증 사용자가 실종 동물 찾기를 누르면 카카오 로그인 창을 보여준다', async () => {
    const user = userEvent.setup()
    const router = renderRoute('/')

    await user.click(
      within(screen.getByRole('navigation', { name: '주요 메뉴' })).getByRole('link', {
        name: '실종 동물 찾기',
      }),
    )

    expect(router.state.location.pathname).toBe('/')
    expect(
      screen.getByRole('heading', { name: '실종 동물 찾기는 로그인이 필요해요' }),
    ).toBeInTheDocument()
    expect(screen.getByText('목격 제보는 로그인 없이 계속 할 수 있어요.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '카카오로 계속하기' })).toHaveFocus()
    expect(screen.queryByRole('button', { name: /Google/ })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '나중에 하기' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('로그인 사용자가 실종 동물 찾기 메뉴를 누르면 입력 화면으로 바로 이동한다', async () => {
    localStorage.setItem('pawpawfind.accessToken', 'mock-access-token')
    const user = userEvent.setup()
    const router = renderRoute('/')

    expect(screen.getByRole('link', { name: '마이페이지' })).toHaveAttribute('href', '/mypage')

    await user.click(
      within(screen.getByRole('navigation', { name: '주요 메뉴' })).getByRole('link', {
        name: '실종 동물 찾기',
      }),
    )

    expect(router.state.location.pathname).toBe('/find/new')
    expect(screen.getByRole('heading', { name: '잃어버린 아이의 정보를 알려주세요' })).toBeVisible()
  })

  it('기존 실종 동물 찾기 주소는 입력 화면으로 이동시킨다', async () => {
    localStorage.setItem('pawpawfind.accessToken', 'mock-access-token')
    const router = renderRoute('/find')

    await waitFor(() => expect(router.state.location.pathname).toBe('/find/new'))
    expect(screen.getByRole('heading', { name: '잃어버린 아이의 정보를 알려주세요' })).toBeVisible()
  })

  it('목격 제보 목록을 공개 경로로 렌더링한다', () => {
    renderRoute('/sightings')
    expect(screen.getByRole('heading', { name: '목격 제보 목록' })).toBeInTheDocument()
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
    expect(
      within(screen.getByRole('navigation', { name: '주요 메뉴' })).getByRole('link', {
        name: '목격 제보',
      }),
    ).toHaveClass('active')
  })

  it('목격 제보 입력 폼을 공개 경로로 렌더링한다', () => {
    renderRoute('/sightings/new')
    expect(
      screen.getByRole('heading', { name: '목격한 동물의 사진을 올려주세요' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '이전으로' })).not.toBeInTheDocument()
    expect(
      within(screen.getByRole('navigation', { name: '주요 메뉴' })).getByRole('link', {
        name: '목격 제보',
      }),
    ).not.toHaveClass('active')
  })

  it('목격 제보 상세 route parameter로 데이터를 불러온다', async () => {
    const user = userEvent.setup()
    renderRoute('/sightings/1')
    expect(
      await screen.findByRole('heading', { name: '연남동 골목에서 갈색 중형견 봤어요' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '다음 사진' }))
    expect(screen.getByText('2 / 2')).toBeInTheDocument()
    expect(
      screen.getByRole('img', {
        name: '연남동 골목에서 갈색 중형견 봤어요 제보 사진 2',
      }),
    ).toBeInTheDocument()
  })

  it('우리 아이 찾기 결과를 출처별로 필터링한다', async () => {
    localStorage.setItem('pawpawfind.accessToken', 'mock-access-token')
    const user = userEvent.setup()
    renderRoute('/find/results/search-1')

    expect(screen.getByRole('heading', { name: '비슷한 동물 검색 결과' })).toBeInTheDocument()
    expect(await screen.findAllByRole('article')).toHaveLength(2)
    expect(
      screen.getByRole('link', { name: '강아지 · 믹스견 · 흰색 후보 상세 보기' }),
    ).toHaveAttribute('href', '/shelter-notices/411314202600123')
    expect(
      screen.getByRole('link', {
        name: '연남동 골목에서 갈색 중형견 봤어요 후보 상세 보기',
      }),
    ).toHaveAttribute('href', '/sightings/1')

    await user.click(screen.getByRole('button', { name: '목격 제보' }))
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(within(screen.getByRole('article')).getByText('목격 제보')).toBeInTheDocument()
  })

  it('보호소 공고 상세 정보를 보여준다', async () => {
    renderRoute('/shelter-notices/411314202600123')

    expect(
      await screen.findByRole('heading', { name: '믹스견 · 흰색 · 수컷 보호 중' }),
    ).toBeInTheDocument()
    expect(screen.getByText('서울-강서-2026-00842')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '보호소 정보' })).toBeInTheDocument()
  })

  it('비슷한 후보가 없으면 다시 검색할 수 있는 빈 결과를 보여준다', async () => {
    localStorage.setItem('pawpawfind.accessToken', 'mock-access-token')
    renderRoute('/find/results/empty')

    expect(
      await screen.findByRole('heading', { name: '아직 비슷한 동물을 찾지 못했어요' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: '정보 수정해서 다시 찾기' })).toHaveAttribute(
      'href',
      '/find/new',
    )
    expect(screen.getByRole('link', { name: '목격 제보 둘러보기' })).toHaveAttribute(
      'href',
      '/sightings',
    )
  })

  it('미인증 사용자를 마이페이지에서 홈으로 이동시키고 목적지를 보존한다', async () => {
    const router = renderRoute('/mypage')

    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(router.state.location.state).toEqual({
      authRequired: true,
      returnTo: '/mypage',
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('미인증 사용자가 실종 동물 찾기 URL에 직접 접근하면 홈으로 이동시킨다', async () => {
    const router = renderRoute('/find/new')

    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(router.state.location.state).toEqual({
      authRequired: true,
      returnTo: '/find/new',
    })
    expect(
      screen.queryByRole('heading', { name: '잃어버린 아이의 정보를 알려주세요' }),
    ).not.toBeInTheDocument()
  })

  it('마이페이지에서 계정과 내 제보를 확인하고 로그아웃한다', async () => {
    const user = userEvent.setup()
    localStorage.setItem('pawpawfind.accessToken', 'mock-access-token')
    localStorage.setItem(
      'pawpawfind.authUser',
      JSON.stringify({ userId: 1, nickname: '포포', provider: 'KAKAO' }),
    )
    const router = renderRoute('/mypage')

    expect(screen.getByRole('heading', { name: '포포' })).toBeInTheDocument()
    expect(await screen.findByText('15건')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: '로그아웃' }))
    expect(router.state.location.pathname).toBe('/')
    expect(localStorage.getItem('pawpawfind.accessToken')).toBeNull()
    expect(localStorage.getItem('pawpawfind.authUser')).toBeNull()
    expect(screen.queryByRole('link', { name: '마이페이지' })).not.toBeInTheDocument()
  })

  it('마이페이지에서 확인 후 내 글을 삭제한다', async () => {
    const user = userEvent.setup()
    localStorage.setItem('pawpawfind.accessToken', 'mock-access-token')
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderRoute('/mypage')

    expect(await screen.findByText('15건')).toBeInTheDocument()
    const report = screen.getByText('연남동 골목에서 갈색 중형견 봤어요').closest('li')
    expect(report).not.toBeNull()

    await user.click(within(report as HTMLElement).getByRole('button', { name: /삭제$/ }))

    await waitFor(() => {
      expect(screen.queryByText('연남동 골목에서 갈색 중형견 봤어요')).not.toBeInTheDocument()
    })
    expect(window.confirm).toHaveBeenCalledWith(
      '“연남동 골목에서 갈색 중형견 봤어요” 글을 삭제할까요? 삭제한 글은 복구할 수 없습니다.',
    )
  })

  it('등록되지 않은 경로에 404 화면을 렌더링한다', () => {
    renderRoute('/unknown')
    expect(screen.getByRole('heading', { name: '페이지를 찾을 수 없습니다.' })).toBeInTheDocument()
  })
})
