# TimeBandSelect

## 용도와 책임

시간 구간 중 하나를 선택하는 controlled custom dropdown이다. 제품 문구, API 코드,
라우트를 알지 않고 사용처가 제공한 option과 현재 value만 표시한다.

## Public API

```ts
interface TimeBandSelectOption<Value extends string> {
  value: Value
  label: string
}

interface TimeBandSelectProps<Value extends string> {
  label: string
  options: readonly TimeBandSelectOption<Value>[]
  value: Value
  onValueChange: (value: Value) => void
  description?: string
  disabled?: boolean
  className?: string
}
```

## 지원 상태

- closed / open
- selected option
- focus-visible
- disabled
- 긴 label과 option 문구
- 좁은 너비에서 줄바꿈

## 지원하지 않는 상태

- multiple selection
- option 그룹과 검색
- 비동기 option 로딩
- 시간 구간 문구나 API 값의 내부 hardcoding
- 폼 검증과 제출

## Native semantics·ARIA

- trigger는 native `button` 요소와 `aria-haspopup="listbox"`, `aria-expanded`를 사용한다.
- menu는 `listbox`, 각 항목은 `option`으로 노출한다.
- 보이는 label과 trigger, description을 `aria-labelledby`·`aria-describedby`로 연결한다.
- 선택 항목은 `aria-selected="true"`로 전달한다.

## Keyboard·focus

- trigger의 `Enter`, `Space`, click으로 menu를 열고 닫는다.
- trigger의 `ArrowDown`, `ArrowUp`으로 menu를 열고 현재 선택 항목에 focus한다.
- menu에서 `ArrowDown`, `ArrowUp`, `Home`, `End`로 항목을 이동한다.
- `Enter`, `Space`로 선택하고 trigger로 focus를 복귀한다.
- `Escape`는 선택을 바꾸지 않고 닫으며, 외부 click과 `Tab`도 menu를 닫는다.
- trigger·option에 `focus-visible` 표시를 제공한다.
- menu가 열릴 때 페이지를 자동 스크롤하지 않고 menu 내부에서만 선택 항목을 노출한다.

## 반응형

- 사용처의 너비를 따라 `width: 100%`로 늘어난다.
- menu는 일반 높이 option을 최대 3개까지 노출하고, 나머지 option은 menu 내부에서 세로
  스크롤해 확인한다.
- 긴 선택 문구는 trigger와 menu에서 줄바꿈하며, 내용이 잘리지 않도록 실제 노출 개수는 3개보다
  적을 수 있다.

## 근거

- 참고 HTML: `/Users/sinseulbin/Downloads/시간대 드롭다운.html`
- 사용처: 목격 제보 입력 폼, 실종 동물 찾기 입력 폼
- 참고한 기존 primitive: `SegmentedControl`, `TextInput`
