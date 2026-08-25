# Button

## 용도

사용자가 화면의 동작을 실행할 때 사용하는 제품 비종속 공용 버튼이다.

## Public API

```ts
interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  size?: 'medium' | 'large'
}
```

- `variant`의 기본값은 `primary`이다.
- `size`의 기본값은 `medium`이다.
- native `button` 속성을 그대로 전달한다.
- `type`의 기본값은 `button`이며, 폼 제출이 필요하면 사용처에서 `submit`을 명시한다.

## 상태

- [x] default
- [x] hover
- [x] focus-visible
- [x] disabled
- [ ] loading: 비동기 중 버튼 문구와 상태 디자인이 확정된 뒤 추가한다.
- [ ] icon-only: 텍스트 버튼과 접근성 계약이 다르므로 이 컴포넌트에서 지원하지 않는다.

## 접근성

- role: native `button`의 기본 role을 사용한다.
- label: `children`으로 인식 가능한 버튼 이름을 제공한다.
- keyboard: native 버튼의 Enter와 Space 동작을 유지한다.
- focus-visible: 키보드 포커스를 명확한 outline으로 표시한다.
- disabled: native `disabled` 속성으로 클릭과 포커스를 차단한다.

## 반응형

- 부모 너비를 임의로 채우지 않는다. 전체 너비 CTA 배치는 사용처가 담당한다.
- 긴 라벨은 고정 높이에 잘리지 않도록 최소 높이와 수직 padding을 사용한다.

## 범위 밖

- API 요청, 라우팅, analytics
- 제품별 문구
- loading spinner와 icon-only 버튼
- 링크 역할

## 참고

- 저장소 근거: `docs/design-audit.md`의 "Primitive 후보"와 "화면과 상태 인벤토리" 섹션
- 반복 근거: 제보 등록 CTA, 닉네임 저장·취소, 오류 재시도 등
- 현재 사용처: 목격 제보 목록의 다시 시도 버튼과 feature 컴포넌트의 보조 행동
- 원본 와이어프레임의 파일명과 무결성 정보는 `docs/design-audit.md`의 "조사 대상과 한계"에서
  관리한다.
