import { Navigate, type RouteObject } from 'react-router'
import { HomePage } from '@/features/home'
import { KakaoAuthCallbackPage } from '@/features/auth'
import {
  MissingAnimalSearchFlowPage,
  MissingAnimalSearchResultPage,
} from '@/features/missing-animal-search'
import { MyPage } from '@/features/my-page'
import { ShelterNoticeDetailPage } from '@/features/shelter-notices'
import { SightingReportDetailPage, SightingReportListPage } from '@/features/sighting-reports'
import { RequireAuth } from './guards/RequireAuth'
import { AppLayout } from './layouts/AppLayout'
import { NotFoundPage } from './pages/NotFoundPage'
import { RouteErrorPage } from './pages/RouteErrorPage'
import { SightingReportFormRoute } from './pages/SightingReportFormRoute'
import { ROUTE_PATHS } from './paths'

export const appRoutes: RouteObject[] = [
  {
    Component: AppLayout,
    ErrorBoundary: RouteErrorPage,
    children: [
      {
        index: true,
        Component: HomePage,
      },
      {
        path: ROUTE_PATHS.KAKAO_AUTH_CALLBACK,
        Component: KakaoAuthCallbackPage,
      },
      {
        path: ROUTE_PATHS.SIGHTING_REPORTS,
        Component: SightingReportListPage,
      },
      {
        path: ROUTE_PATHS.SIGHTING_REPORT_FORM,
        Component: SightingReportFormRoute,
      },
      {
        path: ROUTE_PATHS.SIGHTING_REPORT_DETAIL,
        Component: SightingReportDetailPage,
      },
      {
        path: ROUTE_PATHS.LOST_REPORT_DETAIL,
        element: <SightingReportDetailPage reportType="LOST" />,
      },
      {
        path: ROUTE_PATHS.MISSING_ANIMAL_SEARCH,
        element: <Navigate replace to={ROUTE_PATHS.MISSING_ANIMAL_SEARCH_FORM} />,
      },
      {
        path: ROUTE_PATHS.SHELTER_NOTICE_DETAIL,
        Component: ShelterNoticeDetailPage,
      },
      {
        Component: RequireAuth,
        children: [
          {
            path: ROUTE_PATHS.MISSING_ANIMAL_SEARCH_FORM,
            Component: MissingAnimalSearchFlowPage,
          },
          {
            path: ROUTE_PATHS.MISSING_ANIMAL_SEARCH_RESULT,
            Component: MissingAnimalSearchResultPage,
          },
          { path: ROUTE_PATHS.MY_PAGE, Component: MyPage },
        ],
      },
      {
        path: '*',
        Component: NotFoundPage,
      },
    ],
  },
]
