# TextInput

## 용도와 책임

label, 설명, 오류를 하나의 접근 가능한 계약으로 묶는 공용 한 줄 입력이다. 값과 validation은
사용처가 관리한다.

## Public API

```ts
interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode
  description?: React.ReactNode
  errorMessage?: React.ReactNode
  containerClassName?: string
}
```

- native input 속성을 전달한다. `id`가 없으면 `useId`로 만든다.
- native `disabled`, `required`, controlled/uncontrolled 입력을 그대로 지원한다.

## 상태

- [x] default, filled, disabled, required
- [x] help text, invalid/error message
- [x] hover는 별도 색상 변화 없이 default 테두리를 유지
- [ ] icon slot, password 보기, 검색 지우기: 와이어프레임 근거가 없어 제외한다.

## 접근성과 키보드

- `label[for]`와 `input[id]`를 연결한다.
- 설명과 오류는 `aria-describedby`로 연결하며 오류가 있으면 `aria-invalid=true`를 전달한다.
- native text input의 키보드와 focus 동작을 유지한다.
- `focus-visible`에는 기본 3px 전역 outline보다 얇은 2px outline을 사용하고, accent와 배경을
  섞은 연한 색으로 입력 위치를 표시한다.

## 반응형과 범위 밖

- 기본적으로 부모 너비를 채우고 긴 label/help/error 문구는 줄바꿈한다.
- API 요청, 제출, validation 규칙, React Hook Form은 다루지 않는다.

## 근거

- 저장소 근거: `docs/design-audit.md`의 "Primitive 후보", "화면과 상태 인벤토리", "누락되거나
  불명확한 상태" 섹션
- 반복 근거: 제보 제목과 마이페이지 닉네임 입력
- 원본 와이어프레임의 파일명과 무결성 정보는 `docs/design-audit.md`의 "조사 대상과 한계"에서
  관리한다.
