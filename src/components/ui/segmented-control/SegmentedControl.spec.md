# SegmentedControl

## 용도와 책임

서로 배타적인 짧은 선택지 중 하나를 고르는 controlled 공용 UI다. 동물 종류와 크기 선택에서 같은
동작이 반복된다.

## Public API

```ts
interface SegmentedControlOption<Value extends string> {
  value: Value
  label: React.ReactNode
  disabled?: boolean
}

interface SegmentedControlProps<Value extends string> {
  ariaLabel: string
  options: readonly SegmentedControlOption<Value>[]
  value: Value
  onValueChange: (value: Value) => void
  disabled?: boolean
  className?: string
}
```

- option 값과 문구는 사용처가 제공한다.
- `value`와 변경 처리는 사용처가 관리한다.

## 상태

- [x] unselected, selected, hover, focus-visible
- [x] 전체 disabled와 개별 option disabled
- [ ] multiple selection: `SelectableChip` 사용처가 담당한다.
- [ ] 선택 없음: 현재 두 사용처 모두 필수 단일 선택이므로 지원하지 않는다.

## 접근성과 키보드

- `radiogroup`과 native radio input을 사용한다.
- 그룹 이름은 `ariaLabel`로 제공한다.
- 화살표 키 이동, Space 선택, disabled 제외는 native radio 동작을 따른다.
- 선택된 radio만 일반 Tab 순서에 포함된다.

## 반응형과 범위 밖

- option은 같은 너비로 늘어나며 긴 문구는 줄바꿈한다.
- API, route, analytics, 제품 문구, 폼 제출은 다루지 않는다.

## 시각 토큰

- 반복되는 테두리 두께, 글꼴 굵기, compact line-height는 foundation token을 사용한다.
- option의 `10px` radius, 선택 shadow, hover surface, 화면에서 숨긴 radio 크기는 다른 컴포넌트와
  같은 의미의 반복이 확인되지 않아 컴포넌트 전용 CSS custom property로 관리한다.

## 근거

- 저장소 근거: `docs/design-audit.md`의 "Primitive 후보"와 "화면과 상태 인벤토리" 섹션
- 반복 근거: 제보 등록과 우리 아이 찾기에서 동물 종류·크기 단일 선택이 반복된다.
- 원본 와이어프레임의 파일명과 무결성 정보는 `docs/design-audit.md`의 "조사 대상과 한계"에서
  관리한다.
