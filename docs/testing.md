# Testing

PawpawFind의 테스트 목적과 범위를 정의합니다. 통합 테스트는 Vitest, React Testing Library, MSW를
사용하며 E2E 테스트는 추후 Playwright를 도입할 때 이 기준을 따릅니다.

## 원칙

- 구현 세부사항보다 사용자가 관찰할 수 있는 동작을 검증합니다.
- 테스트 수보다 중요한 사용자 흐름과 실패 가능성이 큰 경계를 우선합니다.
- 네트워크 성공뿐 아니라 loading, empty, error 상태를 검증합니다.
- 테스트를 통과시키기 위해 프로덕션 코드에 테스트 전용 분기를 넣지 않습니다.
- 불안정한 시간 지연, 무작위 값, 외부 네트워크에 의존하지 않습니다.

## 테스트 수준

### Unit

입력과 출력이 명확한 순수 함수, mapper, validation schema처럼 빠르고 독립적으로 검증할 수 있는
로직을 대상으로 합니다.

### Integration

React Testing Library와 MSW를 사용해 사용자의 입력, 화면 상태 변화, API 응답에 따른 결과를
검증합니다. 컴포넌트 내부 state나 private 함수를 직접 검사하지 않습니다.

우선 검증할 상태:

- 최초 loading
- 데이터가 없는 empty
- 정상 success
- API 실패 error와 재시도
- 잘못된 폼 입력
- 비로그인 사용자의 보호된 기능 접근

### E2E

Playwright로 배포 가능한 빌드에서 핵심 사용자 흐름을 검증합니다. 모든 세부 경우를 E2E로 옮기지
않고 라우팅, 브라우저 API, 여러 화면이 연결되는 대표 흐름에 집중합니다.

## 파일 위치

- 테스트 파일은 대상 코드 가까이에 `*.test.ts` 또는 `*.test.tsx`로 둡니다.
- 공통 테스트 초기화는 `src/test`에 둡니다.
- TanStack Query를 사용하는 화면은 `src/test/render.tsx`의 테스트용 provider로 렌더링합니다.
- MSW 서버와 handler 기준은 `docs/api-mocking.md`를 따릅니다.
- Playwright 테스트는 루트 `e2e`에 둡니다.

## 테스트 명령

```bash
pnpm test
pnpm test:watch
pnpm test:coverage
```

`pnpm verify`와 GitHub Actions는 `pnpm test`를 포함합니다. 커버리지 수치는 목표 그 자체로 사용하지
않고, 핵심 흐름의 누락을 찾는 보조 지표로 사용합니다.
