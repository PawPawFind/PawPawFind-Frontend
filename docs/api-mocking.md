# API Mocking

백엔드와 독립적으로 화면을 개발하고 테스트하기 위한 Mock API 기준입니다. 브라우저 개발 환경과
Vitest 통합 테스트에서 MSW를 사용합니다.

## 목표

- 프론트엔드가 합의된 API 계약을 기준으로 먼저 개발할 수 있게 합니다.
- 테스트에서 성공, 지연, 빈 응답, 오류를 재현합니다.
- 실제 API로 전환할 때 화면 코드를 다시 작성하지 않게 합니다.

## 원칙

- Mock과 실제 API가 동일한 request, response, error 타입을 사용합니다.
- 컴포넌트 안에서 `setTimeout`이나 임시 배열로 서버 동작을 흉내 내지 않습니다.
- handler는 HTTP method와 URL을 실제 API 명세와 맞춥니다.
- 정상 응답만 만들지 않고 권한 오류, validation 오류, 서버 오류도 정의합니다.
- Mock 데이터는 결정적으로 유지해 테스트 실행마다 결과가 달라지지 않게 합니다.
- 브라우저 Mock은 개발 환경에서 명시적으로 활성화하며 프로덕션에서는 실행하지 않습니다.
- MSW는 공용 Axios client가 보내는 네트워크 요청을 가로채며 화면 코드에 Mock 분기를 두지 않습니다.

## 예정 구조

```text
src/
  api/
    client.ts
  mocks/
    browser.ts
    server.ts
    handlers/
      auth.ts
      reports.ts
    fixtures/
      reports.ts
  test/
    setup.ts
```

- `browser.ts`: 로컬 브라우저 개발용 worker
- `server.ts`: Vitest에서 사용하는 Node mock server
- `handlers`: 기능별 HTTP 동작
- `fixtures`: 여러 handler와 테스트가 공유하는 결정적 데이터

## 응답 시나리오

각 주요 API는 필요에 따라 다음을 재현할 수 있어야 합니다.

- 성공 응답
- 빈 목록
- 응답 지연
- 400 validation error
- 401 unauthenticated / 403 forbidden
- 404 not found
- 500 server error

테스트별 예외 응답은 해당 테스트에서 handler를 일시 override하고 테스트가 끝나면 초기 handler로
복원합니다.

## 현재 Mock 계약

목격 제보 목록은 백엔드의 Spring Page 계약을 사용합니다. 목록 화면은 한 페이지에 10건을 요청하며
목격 제보만 조회하도록 `reportType=FOUND`를 전달합니다.

```text
GET /api/reports?page=0&size=10&reportType=FOUND
GET /api/reports/:sightingId
```

목록 응답은 `content`, `totalPages`, `totalElements`, `number`, `size`, `pageable` 등을 포함하는
`ReportListApiResponse` 형태입니다. API 계층에서 이를 `SightingReportListItem` 화면 모델로 변환하며,
페이지 버튼을 누르면 새 `page` 값으로 서버에 다시 요청합니다. 개발 Mock은 15건을 제공해 10건과
5건의 두 페이지를 재현합니다.

상세 응답은 아직 백엔드 계약이 확정되지 않아 사진, 비식별 위치 반경, 동물 특징, 예측 이동 경로를
포함하는 `SightingReportDetail` 임시 계약을 유지합니다. 상세의 위치 좌표는 화면에 직접 노출하지 않고
동 단위 주소와 반경으로만 표현합니다.

## 환경변수

Mock 활성화 여부는 `.env.example`에 선언한 환경변수로 제어합니다.

```dotenv
VITE_ENABLE_MSW=true
```

환경변수 문자열을 truthy 값으로 바로 사용하지 않고 명시적으로 파싱합니다. 프로덕션 빌드에서는
이 값과 관계없이 Mock worker가 시작되지 않도록 진입점에서 환경을 함께 확인합니다.
개발 Mock이 활성화되면 Axios는 `VITE_API_BASE_URL`을 사용하지 않고 현재 개발 서버 기준의 상대 경로로
요청합니다. MSW가 이 요청을 가로채므로 로컬 백엔드 서버가 실행 중이지 않아도 됩니다. Mock이 꺼져
있거나 프로덕션 빌드인 경우에만 `VITE_API_BASE_URL`의 실제 백엔드로 요청합니다.
