# Badge

## 용도

출처(목격 제보/보호소)나 유사도 구간처럼, 짧은 보조 정보를 라벨로 표시한다.

## Public API

```ts
interface BadgeProps {
  children: React.ReactNode
  className?: string
}
```

## 상태

- [x] default (유일한 상태 — 배지는 정적 라벨이며 disabled/loading/error 상태를 갖지 않는다)

## 접근성

- role: 없음 (기본 `span`, 장식적 보조 텍스트)
- label: `children` 텍스트 자체가 라벨
- keyboard: 상호작용 없음, 포커스 대상 아님
- focus-visible: 해당 없음

## 반응형

- 좁은 부모 안에서 긴 라벨이 잘리지 않고 줄바꿈된다.

## 참고

- 저장소 근거: `docs/design-audit.md`의 "Color", "Primitive 후보", "Feature 컴포넌트 인벤토리"
  섹션
- 반복 근거: 목격 제보·보호소 출처와 유사 동물 결과의 보조 라벨
- 색상 variant를 두지 않는다: 명세서에 유사도 구간별 배지 색상 차이가 정의돼 있지 않으므로,
  구간별 시각 구분이 필요해지면 그때 근거를 확인하고 추가한다.
- 원본 와이어프레임의 파일명과 무결성 정보는 `docs/design-audit.md`의 "조사 대상과 한계"에서
  관리한다.
