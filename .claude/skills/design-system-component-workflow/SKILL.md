---
name: design-system-component-workflow
description: src/components 공용 UI 컴포넌트를 추가하거나 변경할 때 사용합니다. 컴포넌트가 공용 영역에 속하는지 판단하고, spec 작성 → 구현 → 검증 순서를 따릅니다.
---

# 컴포넌트 작업 흐름 (PawpawFind 축소판)

## 목적

PawpawFind는 아직 단일 패키지 Vite 앱입니다. `src/components/ui`,
`src/components/layout` 폴더 컨벤션과 spec-first 습관만 가져옵니다. 컴포넌트 수가 늘고 재사용
압박이 커지면 그때 패키지 분리를 고려합니다.

## 컴포넌트가 공용 영역(`src/components`)에 속하는지 판단

다음을 모두 만족해야 합니다.

- product-agnostic: 특정 도메인 데이터, API 응답 형태, route에 의존하지 않는다.
- 와이어프레임에서 2곳 이상 반복되거나, 반복될 것이 명백하다.

하나라도 만족하지 않으면 `src/features/<feature>` 아래 로컬 컴포넌트로 둡니다.

## 카테고리

- `ui`: 버튼, 인풋, 카드, 뱃지 등 최소 단위 primitive
- `layout`: 헤더, 컨테이너, 그리드 등 배치 전용 primitive

## 흐름

1. 컴포넌트가 공용 영역에 속하는지 판단합니다 (위 기준).
2. 카테고리(`ui`/`layout`)를 정하고 `src/components/{category}/{kebab-case-이름}/`에 둡니다.
3. `ComponentName.spec.md`를 먼저 채웁니다 (템플릿: `component-spec-template.md`) — 용도,
   public props, 상태, 접근성을 정리합니다.
4. 가장 작은 안정적 public API로 구현합니다.
5. named export만 사용합니다. 내부 헬퍼, 스타일 유틸, 내부 상태 타입은 export하지 않습니다.
   ```ts
   export { Button } from './Button'
   export type { ButtonProps } from './Button'
   ```
6. spec에 적은 상태(default, disabled, loading, error 등)를 `pnpm dev`로 실제 화면에서 눈으로
   확인합니다. (Storybook이 없으므로 임시 페이지나 기존 화면에 렌더링해서 확인)
7. 완료 후 검증을 실행합니다.

## 완료 기준

- 도메인 데이터, API, route, analytics, 제품 copy에 의존하지 않는다.
- public prop type을 export한다.
- spec.md에 지원/미지원 상태가 명시되어 있다.
- 실제 화면에서 상태별로 눈으로 확인했다.

## 검증

```bash
pnpm format:check
pnpm lint
pnpm build
```

## 예외

- 한 곳에서만 쓰이는 컴포넌트는 공용 영역으로 승격하지 않습니다.
- product copy, route data, API 응답 형태를 공용 컴포넌트에 하드코딩하지 않습니다.
- 실제 재사용 근거나 와이어프레임 반복 근거 없이 `src/features` 컴포넌트를 `src/components`로
  올리지 않습니다.
