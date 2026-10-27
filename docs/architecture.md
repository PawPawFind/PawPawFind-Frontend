# Architecture

PawpawFind 프론트엔드의 현재 구조와 코드 배치 기준을 정의합니다.

## 현재 구조

```text
src/
  app/          앱 조립, provider, router와 전역 route 경계
  api/          여러 기능이 공유하는 API 기반 코드
  components/   도메인에 종속되지 않는 공용 UI
  features/     기능과 도메인 단위 코드
  hooks/        여러 기능에서 재사용하는 훅
  styles/       전역 스타일과 디자인 토큰
  types/        여러 기능이 공유하는 타입
```

`src/app`은 제품 feature를 조립하는 최상위 계층입니다. route path, 인증 guard, 앱 layout, 전역
provider를 이곳에서 관리하며 feature 내부 구현을 다시 export하지 않습니다.

## 코드 배치 기준

### Feature first(FSD)

페이지, 기능 전용 컴포넌트, 기능 전용 훅과 API는 `src/features/<feature>`에 먼저 둡니다. 한 곳에서만
사용하는 코드를 재사용 가능할 것이라는 예상만으로 공용 영역에 올리지 않습니다.

```text
src/features/<feature>/
  pages/
  components/
  hooks/
  api/
  types.ts
  index.ts
```

폴더는 실제 필요한 경계만 만들며 빈 디렉터리를 미리 만들지 않습니다.

`pages`는 router가 직접 렌더링하는 feature 진입점입니다. page 아래에서 같은 feature의 components,
hooks, api를 조합하고 router 설정 자체는 알지 않습니다.

목격 제보와 실종 동물 찾기의 route·제출 결과는 각각 `sighting-reports`와
`missing-animal-search` feature로 분리합니다. 두 화면에서 동일하게 사용하는 사진 우선 입력·분석·검토
흐름만 `src/features/report-form`이 소유합니다. 이는 두 도메인을 포괄하는 범용 `reports` feature가
아니라, 실제로 공유되는 입력 흐름에 한정된 경계입니다.

두 feature가 공유하는 서버 코드값과 요청 필드 타입은 `src/types/report.ts`, 폼 상태 로직은
`src/hooks/useReportForm.ts`에 둡니다. `report-form`은 mode에 따라 화면 문구와 `FOUND`·`LOST`
payload를 만들고, 각 page는 route에서 받은 제출 callback과 오류·진행 상태만 연결합니다.

두 입력 feature가 공유하는 카카오 지도 SDK 로딩과 제보 위치 선택은 `src/features/report-location`에
둡니다. 지도 제공사, 주소 변환과 제보 위치 계약을 아는 기능이므로 `src/components/ui` primitive로
올리지 않습니다. 각 입력 페이지는 장소·좌표 controlled value와 화면 문구를 전달합니다.

### Shared UI

`src/components`의 코드는 다음 조건을 만족해야 합니다.

- 특정 도메인 데이터나 API 응답 형태를 알지 않는다.
- 라우트와 제품 기능에 직접 의존하지 않는다.
- 두 곳 이상에서 실제로 재사용되거나 반복 근거가 명확하다.

공용 컴포넌트 작업은 `.claude/skills/design-system-component-workflow/SKILL.md`를 따르고 public API와
상태, 접근성을 spec에 먼저 기록합니다. 공용 승격 기준과 foundation 규칙은
`docs/design-system.md`, 와이어프레임에서 확인한 근거는 `docs/design-audit.md`를 따릅니다.

### Shared types and hooks

- 기능 내부에서만 쓰는 타입은 feature 가까이에 둡니다.
- 여러 기능이 같은 의미로 공유할 때만 `src/types`로 이동합니다.
- 커스텀 훅은 로직을 숨기기 위해 만들지 않고, 의미 있는 동작이 재사용될 때 추출합니다.

## 상태 경계

- 서버에서 받은 데이터와 요청 상태: 서버 상태 관리 계층
- URL에서 표현할 수 있는 검색·필터: URL 상태
- 한 컴포넌트 트리에서만 쓰는 값: React 로컬 상태
- 여러 화면이 공유하지만 서버에 없는 값: 필요성이 확인된 뒤 전역 클라이언트 상태
- 입력 폼 값: 폼 경계 내부 상태

서버 상태는 TanStack Query로 관리하고 HTTP 요청은 공용 Axios client를 사용합니다. 아직 도입되지
않은 다른 도구는 React 기본 기능으로 가장 작은 구현을 만들고, 실제 문제가 생긴 뒤 추가합니다.

## Router

- React Router Data Mode의 `createBrowserRouter`와 `RouterProvider`를 사용합니다.
- router 인스턴스와 route tree는 React render 밖의 `src/app/router`에서 한 번 생성합니다.
- route matching pattern은 `ROUTE_PATHS`, 실제 이동 URL은 `routeUrls`에서 관리합니다.
- 동적 segment를 만드는 함수는 값을 `encodeURIComponent`로 인코딩합니다.
- URL path는 page와 resource ID, search params는 필터·페이지·정렬 상태를 표현합니다.
- API 서버 상태는 계속 TanStack Query가 담당하며 현재 route loader/action으로 옮기지 않습니다.
- 인증 경계는 별도 router가 아니라 path가 없는 `RequireAuth` route와 `Outlet`으로 구성합니다.
- 미인증 redirect의 최종 로그인 UX는 아직 미정입니다. 현재는 홈으로 이동하며 `returnTo`를 route
  state에 보존합니다.

### 확정 route

| URL                       | 페이지                          | 인증 |
| ------------------------- | ------------------------------- | ---- |
| `/`                       | 홈 placeholder                  | 공개 |
| `/sightings`              | 목격 제보 목록                  | 공개 |
| `/sightings/new`          | 목격 제보 입력 폼               | 공개 |
| `/sightings/:sightingId`  | 목격 제보 상세 placeholder      | 공개 |
| `/find`                   | `/find/new`로 이동              | 공개 |
| `/find/new`               | 실종 동물 찾기 입력 폼          | 필요 |
| `/find/results/:searchId` | 실종 동물 찾기 결과 placeholder | 필요 |
| `/mypage`                 | 마이페이지 placeholder          | 필요 |

Browser history 기반 URL을 사용하므로 배포 서버는 파일이 없는 경로 요청에도 `index.html`을
반환하는 SPA fallback이 필요합니다.

## 입력 데이터 계약

- 목격 제보는 `reportType: 'FOUND'`와 필수 제목을 사용합니다.
- 실종 동물 찾기는 `reportType: 'LOST'`를 사용하며 제목을 받지 않습니다.
- 동물 종류는 `DOG | CAT` 서버 코드를 사용하며 2단계 제출의 최소 필수값입니다.
- 크기는 `SMALL | MEDIUM | LARGE` 서버 코드를 사용하지만 사진 우선 UI에서는 사용자가 직접 고르는
  선택값이므로 현재 mock 요청 타입에서 `null`을 허용합니다. 실제 API 연결 전에 nullable 여부를
  백엔드 계약과 다시 동기화합니다.
- 시간은 2시간 단위 구간으로 선택합니다. 사진 우선 1단계에서는 시간대를 필수로 받고, `eventHour`
  정수 하나에 구간의 중간 시각(`14–16시` → `15`)을 담습니다.
- 털색은 report 본문의 단일 color가 아니라 다른 특징과 함께 `{ category, keyword }`로 관리합니다.
- 화면 label과 API 값은 분리합니다. 예를 들어 화면의 `털 길이`는 category `털길이`, 화면의
  `접힘`은 keyword `접힌 귀`로 변환합니다.
- 사진 파일은 폼에서 선택 순서와 함께 관리하지만 외부 storage 업로드와 사진 URL 등록은 제외합니다.
- 상세 설명은 현재 폼 범위에서 제외합니다.
- 카카오 지도 중심 좌표는 WGS84 위·경도로 저장하고 `services.Geocoder.coord2Address` 결과에서
  도로명 주소를 우선 사용합니다. 지도 기본 중심은 사용자가 지도를 이동하기 전에는 폼 값으로
  저장하지 않습니다.
- SDK 키가 없거나 로딩에 실패하면 장소와 좌표를 직접 입력할 수 있으며, 지도 연동과 별개로 생성 API
  요청은 아직 연결하지 않습니다.

### 사진 분석 mock 경계

- `src/features/report-form/analysis`의 `ReportImageAnalyzer`가 사진 분석 경계입니다.
- 현재 기본 구현은 지연·성공·실패를 재현하는 `mockReportImageAnalyzer`이며 네트워크 요청을 보내지
  않습니다. 파일명에 `fail`이 포함된 테스트 사진은 분석 실패 상태를 재현합니다.
- mock 성공 결과는 동물 종류, AI 특징, 품종 후보를 제안합니다. 품종 후보는 자동 선택하지 않습니다.
- 크기·몸 상태·행동은 사용자 직접 입력으로 유지하고, 분석이 실패하면 동물 종류만 필수인 직접 입력
  모드로 전환합니다.
- 실제 분석 endpoint, 요청 형식, 응답 nullability와 오류 코드는 확정하지 않았습니다. 연결 시
  `.claude/skills/backend-api-integration/SKILL.md`의 계약 동기화 절차를 따릅니다.

## 의존 방향

```text
src/main.tsx -> src/app -> src/features/<feature> -> shared UI / shared API foundation
```

- 공용 UI가 feature를 import하지 않습니다.
- 공용 타입에 화면 컴포넌트나 라우트 타입을 섞지 않습니다.
- feature는 `src/app`이나 router를 import하지 않습니다.
- 순환 의존성을 만들지 않습니다.
- 배럴 export는 feature의 의도된 public API에만 사용합니다.

## 변경 원칙

- 구조 변경은 현재 문제와 영향을 먼저 기록합니다.
- 앱이 실제로 둘 이상 생기기 전에는 모노레포로 전환하지 않습니다.
- 공용 패키지 분리는 여러 소비자와 독립적인 변경·배포 필요성이 확인된 뒤 결정합니다.
