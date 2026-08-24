# Design System

PawpawFind의 foundation과 공용 UI 경계를 정의합니다. 구체적인 화면 근거와 후보 목록은
`docs/design-audit.md`를 사용하고, 공용 컴포넌트 구현 절차는
`.claude/skills/design-system-component-workflow/SKILL.md`를 따릅니다.

## 원칙

- Claude Design 결과는 구현 명세가 아니라 반복 규칙을 찾는 증거로 사용합니다.
- foundation, primitive, feature를 분리합니다.
- 비슷하게 생겼다는 이유만으로 컴포넌트를 합치지 않습니다.
- 실제 사용 근거가 생기기 전에는 feature 가까이에 둡니다.
- 접근성과 상태를 한곳에서 보장할 가치가 있을 때 공용 primitive로 승격합니다.
- public API는 현재 확인된 요구만 지원하며 예상으로 variant를 추가하지 않습니다.

## 계층

### Foundation

색상, 글꼴, 간격, radius, shadow, motion처럼 여러 UI가 공유하는 시각 값입니다. 구현 위치는
`src/styles`입니다.

토큰으로 승격하려면 다음을 확인합니다.

- 두 곳 이상에서 같은 값과 같은 의미로 반복되는가?
- 이름이 특정 화면이나 컴포넌트에 종속되지 않는가?
- 값이 바뀔 때 함께 바뀌어야 하는 소비자가 있는가?

색상과 타이포그래피를 포함한 확정 token의 source of truth는 `src/styles/tokens.css`입니다.

### 확정된 foundation token

| 범주     | 이름과 값                                                                             | 사용 목적과 근거                                                          |
| -------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| color    | `--color-accent-text: #b45309`                                                        | 흰 배경 위 단계 표시·선택 표시·위치 상태 안내에 반복되는 진한 주황 텍스트 |
| disabled | `--color-disabled: #c3c8cf`                                                           | 와이어프레임의 비활성 pagination과 여러 control의 비활성 텍스트           |
| control  | `--control-height: 44px`                                                              | Button medium, 입력, segmented option의 최소 키보드·터치 영역             |
| border   | `--border-width-default: 1px`                                                         | control과 feature surface의 기본 구분선 두께                              |
| type     | `--font-weight-semibold: 600`, `--line-height-compact: 1.4`                           | 선택 control과 label에서 반복되는 강조 굵기와 짧은 문구용 행간            |
| spacing  | `--space-1/2/3/4/5/6/8: 4/8/12/16/20/24/32px`                                         | primitive 내부 간격과 feature surface에서 같은 의미로 반복되는 core scale |
| radius   | `--radius-sm/md/lg/full: 8/12/16/999px`                                               | chip·pagination / button·input / panel / pill에서 반복되는 모서리         |
| focus    | `--focus-outline: 3px solid var(--color-text-primary)`, `--focus-outline-offset: 2px` | 모든 interactive primitive의 일관된 `focus-visible` 표시                  |

`10px` segmented option radius, 선택 shadow, hover surface, 숨긴 radio 크기는 해당 컴포넌트의
CSS custom property로 관리한다. 같은 의미가 두 컴포넌트 이상에서 확인되지 않아 foundation token으로
승격하지 않았다. Storybook preview 폭은 제품 layout token이 아니라 `.storybook/preview.css`의 명명된
preview layout class로 관리한다.

### Primitive

제품 데이터, API, route, analytics, 제품 문구를 모르는 공용 UI입니다. 구현 위치는
`src/components/ui`입니다.

다음 질문에 모두 답할 수 있을 때만 승격합니다.

- 실제로 두 군데 이상에서 반복되는가?
- 같은 props와 동작으로 사용할 수 있는가?
- 특정 페이지 데이터 없이 성립하는가?
- native HTML semantics와 키보드 동작을 공통으로 보장할 수 있는가?
- 상태별 디자인과 접근성 요구를 spec에 적을 수 있는가?

### Layout

콘텐츠 의미 없이 배치만 담당하는 공용 primitive입니다. 실제 반복이 확인되면
`src/components/layout`에 둡니다. 단순한 `div` 한 번을 감싸기 위해 만들지 않습니다.

### Feature

제품 데이터, 사용자 흐름, API, route 또는 제품 문구에 의존하는 UI입니다. 구현 위치는
`src/features/<feature>`입니다. 여러 화면에서 쓰이더라도 같은 도메인 책임을 가진다면 feature
컴포넌트로 유지합니다.

## Component contract

핵심 primitive와 상태가 복잡한 공용 컴포넌트는 구현 전에 `ComponentName.spec.md`를 작성합니다.

필수 항목:

- 용도와 책임
- public props
- 지원 상태와 지원하지 않는 상태
- native semantics
- keyboard와 focus-visible
- responsive behavior
- out of scope
- 근거가 된 화면 또는 기존 사용처

작은 정적 helper까지 모두 spec으로 만들지는 않습니다.

## 구현된 공용 primitive

| Primitive        | 책임                                | 주요 지원 상태                                                   |
| ---------------- | ----------------------------------- | ---------------------------------------------------------------- |
| Button           | 제품 비종속 동작 실행               | primary/secondary, medium/large, hover, focus-visible, disabled  |
| Badge            | 정적인 짧은 보조 정보               | 기본, 긴 문구 줄바꿈                                             |
| SelectableChip   | 독립적인 선택 on/off                | selected/unselected, hover, focus-visible, disabled              |
| SegmentedControl | 필수 단일 선택                      | selected/unselected, 전체·option disabled, native radio keyboard |
| TextInput        | label·설명·오류가 연결된 한 줄 입력 | default/filled/disabled/required/help/invalid                    |
| TimeBandSelect   | 시간 구간 단일 선택 custom dropdown | closed/open/selected/disabled, listbox keyboard                  |
| ImageViewer      | 상세 사진을 modal에서 전체 표시     | closed/open, Esc·닫기 버튼, focus 복귀                           |

공용 export는 각 컴포넌트 폴더의 `index.ts`에서 named export로만 제공한다.

## 구현된 feature 컴포넌트

목격 제보 문구와 데이터 의미를 아는 아래 컴포넌트는
`src/features/sighting-reports/components`에 둔다.

- `SightingReportListItem`: 제보 한 건의 요약과 선택 가능한 상태
- `SightingReportFilterPanel`: 도메인 필터 그룹과 초기화
- `ActiveSightingReportFilters`: 적용된 필터 제거
- `SightingReportPagination`: 목격 제보 목록의 페이지 이동

현재 API 응답으로 바로 표현 가능한 목록 항목만 `SightingReportListPage`에 연결했다. 필터 query와
pagination 조회 계약은 확정되지 않아 page/API 타입을 추측하지 않고 Storybook에서 독립 검증한다.

## 파일 구조

```text
src/
  components/
    ui/
      <kebab-case-name>/
        ComponentName.tsx
        ComponentName.css
        ComponentName.test.tsx
        ComponentName.spec.md
        index.ts
    layout/                    실제 반복이 생겼을 때만 추가
  features/
    <feature>/
      components/
  styles/
    tokens.css
```

- 공용 컴포넌트는 named export를 사용합니다.
- public prop type만 export합니다.
- feature 전용 helper와 내부 상태 타입은 export하지 않습니다.
- CSS는 가능한 한 기존 토큰을 사용하며 근거 없는 새 전역 토큰을 추가하지 않습니다.

## 승격 절차

1. Claude Design과 현재 코드에서 실제 반복 사용처를 찾습니다.
2. primitive, layout, feature 중 책임을 분류합니다.
3. 공용 후보라면 spec을 먼저 작성합니다.
4. 가장 작은 public API로 첫 사용처를 구현합니다.
5. 두 번째 사용처에서도 같은 계약이 성립하는지 확인합니다.
6. 상태별 접근성과 반응형 결과를 시각적으로 확인합니다.
7. 테스트와 `pnpm verify`를 통과시킵니다.

두 번째 사용처에서 prop 분기와 제품 문구가 늘어난다면 공용화가 잘못된 신호입니다. feature로
되돌리거나 서로 다른 컴포넌트로 분리합니다.

## Verification

- spec과 구현의 props·상태가 일치하는가?
- 지원하는 상태를 `*.stories.tsx`로 작성했는가?
- native element와 heading 구조가 적절한가?
- keyboard와 focus-visible을 확인했는가?
- disabled와 loading 중 중복 동작이 차단되는가?
- 긴 텍스트와 좁은 화면을 확인했는가?
- 현재 화면의 시각 회귀가 없는가?
- `pnpm verify`가 통과하는가?

공용 UI는 Storybook에서 상태를 독립적으로 확인하고 Chromatic에서 시각 변경을 검토합니다. Storybook
정적 빌드는 `pnpm verify`에 포함합니다. 새로운 시각 변경은 기준 이미지로 자동 승인하지 않고
Chromatic에서 의도한 변경인지 확인합니다.

## 자동화 기준

컴포넌트 수가 많다는 이유만으로 generator나 Skill을 추가하지 않습니다. 같은 파일 생성, spec 누락,
검증 누락이 반복적으로 발생해 문서만으로 방지하기 어려울 때 자동화를 도입합니다.
