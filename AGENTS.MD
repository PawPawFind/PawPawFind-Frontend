# PawpawFind Agent Guide

이 문서는 저장소 전체에서 사람과 AI 에이전트가 따르는 작업 기준입니다. 세부 기준은 관련 문서를
source of truth로 사용하고, 이 파일에 중복해서 적지 않습니다.

## 프로젝트

- React 18, TypeScript, Vite 기반 단일 SPA입니다.
- 패키지 매니저는 pnpm입니다.

## 작업 전 확인

1. `README.md`와 작업에 관련된 기존 코드를 먼저 읽습니다.
2. `docs/architecture.md`에서 코드가 속할 위치를 확인합니다.
3. 기존 구현을 검색하고, 요청 범위를 넘어선 추상화나 리팩터링을 추가하지 않습니다.
4. API 계약이 불명확하면 임의로 확정하지 않고 명시적인 mock 경계를 둡니다.

백엔드 API를 새로 연결하거나 기존 계약을 변경할 때는
`.claude/skills/backend-api-integration/SKILL.md`의 계약 동기화 흐름을 따릅니다.

## 구조 기준

- `src/components`: 도메인, API, 라우트에 의존하지 않는 공용 UI
- `src/features`: 기능과 도메인에 종속된 화면, 컴포넌트, 훅, API
- `src/api`: 여러 기능이 공유하는 HTTP 클라이언트와 API 기반 코드
- `src/hooks`: 여러 기능에서 실제로 재사용하는 훅
- `src/types`: 여러 기능이 공유하는 공용 타입
- `src/styles`: 전역 스타일과 디자인 토큰

한 기능에서만 사용하는 코드는 해당 feature 안에 먼저 둡니다. 실제 재사용이 확인되기 전에는 공용
영역으로 이동하지 않습니다. 자세한 기준은 `docs/architecture.md`를 따릅니다.

공용 UI 컴포넌트를 추가하거나 변경할 때는
`.claude/skills/design-system-component-workflow/SKILL.md`의 spec-first 흐름을 함께 따릅니다.
디자인 시스템의 계층과 승격 기준은 `docs/design-system.md`, Claude Design에서 확인한 근거와 후보는
`docs/design-audit.md`를 source of truth로 사용합니다.

## 코드 작성 원칙

- 서버 상태, 전역 클라이언트 상태, 컴포넌트 로컬 상태를 구분합니다.
- 비동기 화면에는 필요한 loading, empty, error, success 상태를 고려합니다.
- 타입 오류를 `any`, 불필요한 타입 단언, lint 비활성화로 숨기지 않습니다.
- 시맨틱 HTML과 키보드 접근이 가능한 요소를 우선합니다.
- 비밀 값과 환경별 설정을 소스 코드에 직접 작성하지 않습니다.
- Mock API는 실제 API와 같은 요청·응답 계약을 사용합니다.
- 생성 파일과 사용자의 기존 변경사항을 덮어쓰지 않습니다.

## 검증

코드 또는 설정 변경 후 다음 명령을 실행합니다.

```bash
pnpm verify
```

문서만 변경한 경우 최소 검증은 다음과 같습니다.

```bash
git diff --check
pnpm format:check
```

검증을 실행하지 못했거나 일부를 생략했다면 완료 보고에 이유를 남깁니다. 테스트 도입 전까지
`verify`는 format, lint, typecheck, build를 수행하며 테스트 환경이 추가되면 test를 포함합니다.

## Git

- 요청 없이 commit, push, merge하지 않습니다.
- 관련 없는 변경을 같은 작업에 포함하지 않습니다.
- 변경 전 현재 branch와 working tree 상태를 확인합니다.
- 기능 또는 설정 단위로 독립적으로 검토하고 되돌릴 수 있게 작업합니다.

## 관련 문서

- 구조와 의존 방향: `docs/architecture.md`
- 디자인 시스템 경계: `docs/design-system.md`
- Claude Design 조사: `docs/design-audit.md`
- 테스트 전략: `docs/testing.md`
- Mock API 원칙: `docs/api-mocking.md`
