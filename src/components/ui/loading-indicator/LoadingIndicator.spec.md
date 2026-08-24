# LoadingIndicator

비동기 작업 중임을 Lottie 애니메이션과 짧은 문구로 알리는 공용 로딩 상태다. 도메인 문구는
`label`로 주입하며 컴포넌트 안에 제품 카피를 포함하지 않는다.

## Public API

- `label: string`: 화면과 접근성 트리에 표시할 로딩 안내.
- `size?: 'small' | 'medium'`: 애니메이션 크기. 기본값은 `medium`.
- `className?: string`: 배치 조정을 위한 추가 클래스.

## 상태와 접근성

- 루트는 `role=status`, `aria-live=polite`를 사용한다.
- Lottie 그림은 장식이므로 접근성 트리에서 제외하고 `label`만 읽는다.
- 애니메이션은 반복 재생한다.
- `prefers-reduced-motion: reduce`에서는 반복 재생을 멈추고 정지 프레임을 표시한다.
