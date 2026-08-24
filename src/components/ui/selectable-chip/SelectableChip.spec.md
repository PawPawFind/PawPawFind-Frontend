# SelectableChip

## 용도

필터나 특징처럼 짧은 선택지를 켜고 끌 때 사용하는 제품 비종속 공용 칩이다.

## Public API

```ts
interface SelectableChipProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-pressed' | 'children'
> {
  children: React.ReactNode
  selected: boolean
}
```

- `selected`는 필수 controlled prop이며 시각 상태와 `aria-pressed`를 함께 결정한다.
- native `button` 속성을 그대로 전달한다.
- `type`의 기본값은 `button`이다.
- 선택 상태 변경과 단일·다중 선택 규칙은 사용처가 관리한다.

## 상태

- [x] unselected: 기본 surface, border, secondary text
- [x] selected: accent border, accent-soft surface, primary text와 semibold 강조
- [x] hover
- [x] focus-visible
- [x] disabled
- [ ] removable: 선택 상태 토글과 삭제 동작을 하나의 API에 섞지 않는다.
- [ ] color swatch prop: 제품별 색상 값은 사용처가 인식 가능한 label과 함께 children으로 조합한다.

## 접근성

- role: native `button`의 기본 role을 사용한다.
- label: `children`으로 인식 가능한 선택지 이름을 제공한다.
- state: 선택 여부를 `aria-pressed`로 전달한다.
- keyboard: native 버튼의 Enter와 Space 동작을 유지한다.
- focus-visible: 키보드 포커스를 명확한 outline으로 표시한다.
- disabled: native `disabled` 속성으로 클릭과 포커스를 차단한다.

## 반응형

- 칩 자체는 내용 너비를 사용하고, 줄바꿈과 정렬은 부모가 담당한다.
- 긴 라벨이 잘리지 않도록 고정 너비를 사용하지 않는다.

## 범위 밖

- 선택 목록 상태와 single/multi 규칙
- 필터 삭제 버튼
- 제품별 value와 문구
- 색상 견본, 아이콘, 개수 표시

## 참고

- 저장소 근거: `docs/design-audit.md`의 "Primitive 후보"와 "화면과 상태 인벤토리" 섹션
- 반복 근거: 목록 필터, 동물 특징, 결과 출처 선택
- 디자인 근거: `CHIP_ON`, `CHIP_OFF` 상태
- 원본 와이어프레임의 파일명과 무결성 정보는 `docs/design-audit.md`의 "조사 대상과 한계"에서
  관리한다.
