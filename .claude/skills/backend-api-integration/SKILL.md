---
name: backend-api-integration
description: PawpawFind 백엔드 API를 새로 연결하거나 Swagger 변경을 프론트 타입, API 함수, TanStack Query, MSW와 테스트에 반영할 때 사용합니다.
---

# 백엔드 API 연동 흐름

## 기준 계약

- 작업 시 사용자나 팀에서 전달한 최신 OpenAPI 또는 Swagger UI를 확인합니다.
- 백엔드 주소를 skill에 고정하지 않고 현재 환경변수와 배포 설정을 기준으로 확인합니다.
- API base URL은 환경변수 `VITE_API_BASE_URL`로만 주입합니다.
- `/api/internal/**`는 백엔드 내부 처리용이므로 브라우저에서 호출하지 않습니다.

명세는 변경될 수 있으므로 저장된 기억이나 예전 예시보다 라이브 OpenAPI를 우선합니다. 다만 명세에
필수값, 인증 방식, 요청 body가 불명확하면 프론트에서 추측하지 말고 백엔드 확인 사항으로 남깁니다.

## 연동 순서

1. 작업 대상 endpoint의 method, path/query parameter, request/response schema와 status code를 라이브
   OpenAPI에서 확인합니다.
2. 현재 `src/api`, 해당 `src/features/<feature>/api`, 타입, Query hook, MSW handler와 fixture를
   검색해 계약 차이를 정리합니다.
3. 서버 DTO와 화면 모델을 구분합니다. API 계층에서 필요한 변환을 수행하고 컴포넌트에 서버 응답
   구조를 직접 퍼뜨리지 않습니다.
4. 공용 Axios client를 사용하고 서버 상태는 TanStack Query로 관리합니다. URL로 표현할 수 있는
   페이지·필터는 URL 상태로 유지합니다.
5. MSW handler는 실제 endpoint와 동일한 요청·응답 계약을 사용합니다. 화면 코드에 Mock 전용 분기나
   고정 지연을 넣지 않습니다.
6. 최소한 성공, 빈 응답, 오류 상태와 실제 query parameter 전달을 테스트합니다.
7. `pnpm verify`로 검증합니다.

## 로컬 실제 API 전환

- 백엔드는 `http://www.pawpawfind.com`과 `http://localhost:5173` Origin을 허용합니다.
- 실제 API 확인 시 `.env`에서 `VITE_API_BASE_URL`을 현재 백엔드 주소로 설정하고
  `VITE_ENABLE_MSW=false`로 변경한 뒤 Vite 개발 서버를 재시작합니다.
- Mock 개발 시 `VITE_ENABLE_MSW=true`로 되돌립니다. 이때 Axios는 API base URL 대신 상대 경로를
  사용하고 MSW가 요청을 가로챕니다.
- CORS 문제를 판단할 때는 preflight 응답의 `Access-Control-Allow-Origin`을 먼저 확인합니다. Swagger와
  Origin 없는 API까지 `502`이면 CORS가 아니라 nginx 뒤 백엔드 애플리케이션의 장애입니다.
- 개발 모드에서 `(canceled)` 요청 뒤 동일 요청이 200이면 React Strict Mode가 첫 mount의 요청을
  AbortSignal로 취소한 정상 동작입니다. 5xx 요청이 네 번 보이면 TanStack Query의 최초 요청과 기본
  재시도 3회일 수 있습니다.

## 실제 응답에서 확인된 계약

- `GET /api/reports`의 `species`와 `size`는 `DOG`, `MEDIUM`뿐 아니라 `강아지`, `중형` 같은 한글 값으로
  올 수 있으므로 매퍼는 둘 다 허용합니다.
- `Reports`의 `userId`, `eventHour`, `description`은 `null`일 수 있습니다.
- 제보 목록 응답에는 대표 사진 URL이 없습니다. 목록 이미지 때문에 제보별 사진 API를 N회 호출하기
  전에 백엔드의 thumbnail 필드 제공 여부를 협의합니다.
- 목격 제보 상세 화면은 `GET /api/reports/{reportId}`, `GET /api/report-photos?reportId=...`,
  `GET /api/report-features?reportId=...` 응답을 API 계층에서 조합합니다.
- 제보 사진은 `sortOrder`로 정렬하고, 특징은 `category`별 `keyword`를 화면 모델로 변환합니다.

## 아직 확인이 필요한 계약

- 현재 배포 프론트와 API가 모두 HTTP입니다. 프론트를 HTTPS로 전환하면 HTTP API 호출은 브라우저의
  mixed-content 정책에 막히므로 API도 HTTPS로 제공해야 합니다.
- 제보 생성·수정과 사진·특징 생성·수정의 `requestEntity`가 OpenAPI상 query parameter로 표시됩니다.
  JSON request body 의도인지 백엔드와 확인한 뒤 구현합니다.
- OpenAPI schema에 `required`와 인증 security scheme이 표시되지 않습니다. UI 필수값이나 보호 route만
  근거로 서버 필수값·인증 헤더를 확정하지 않습니다.
- Presigned upload 응답과 일부 생성 응답이 구체적 schema 없이 `object`입니다. 응답 필드가 확정되기
  전에는 임시 타입 경계를 명시합니다.

## 프론트가 사용하는 공개 API 범위

- 인증: `/api/auth/kakao`
- 제보: `/api/reports`, `/api/reports/{reportId}`, `/api/reports/me`
- 제보 사진·특징: `/api/report-photos`, `/api/report-features`
- 업로드: `/api/uploads/presign`
- 매칭: `/api/reports/{reportId}/run-match`, `/api/reports/{reportId}/matches`
- 보호소 동물: `/api/animals`, `/api/animals/{desertionNo}`

새 endpoint가 추가되면 이 목록을 기계적으로 늘리기 전에 실제 브라우저 소비 대상인지 먼저 판단합니다.
