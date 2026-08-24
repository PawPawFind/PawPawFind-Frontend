# ImageViewer

## 용도

메인 사진 자체를 눌러 원본 비율의 큰 이미지를 모달에서 확인하게 한다.

## Public API

```ts
interface ImageViewerProps {
  src: string
  alt: string
  triggerLabel: string
}
```

## 상태

- [x] 닫힘: 메인 사진을 확대 미리보기 버튼으로 표시한다.
- [x] 열림: modal dialog와 전체 사진, 닫기 버튼을 표시한다.
- [x] 사진 변경: `src`와 `alt`가 바뀌면 새 사진을 확대한다.
- [ ] loading
- [ ] error

## 접근성

- role: native `button`, modal `dialog`
- label: 이미지의 `alt`와 사진 버튼의 `triggerLabel`을 소비자가 제공하며, 닫기 버튼에 명시적 label을 제공한다.
- keyboard: Enter/Space로 열고, Esc 또는 닫기 버튼으로 닫는다.
- focus-visible: 사진·닫기 버튼에 공용 focus outline을 표시하며 닫은 뒤 사진 버튼으로 포커스를 돌린다.

## 반응형

- dialog는 viewport 안에서 가능한 영역을 사용하고 사진은 원본 비율을 유지한다.
- 작은 화면에서도 닫기 버튼은 최소 터치 영역을 유지한다.

## 범위 밖

- 이미지 다운로드, 확대 배율 조절, 회전, 여러 사진 사이 이동
- 이미지 로딩 및 오류 fallback

## 참고

- 사용처: 보호소 공고 상세, 목격 제보 상세, 실종 제보 상세
- 참고한 기존 컴포넌트: `LoginSheet`의 native dialog 처리
