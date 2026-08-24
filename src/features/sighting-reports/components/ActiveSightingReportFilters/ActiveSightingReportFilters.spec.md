# ActiveSightingReportFilters

현재 적용된 목격 제보 필터를 제거 가능한 목록으로 보여준다. 각 항목은 삭제 동작이므로 선택 토글용
`SelectableChip`과 분리한다. 선택 없음에는 렌더링하지 않으며 filter 값/label 변환과 URL 상태는
부모 책임이다. 긴 label과 좁은 너비를 지원한다.

## 근거

- 저장소 근거: `docs/design-audit.md`의 "화면과 상태 인벤토리"와 "Feature 컴포넌트 인벤토리"
  섹션
- 확인된 흐름: 목격 제보 목록에서 선택 필터를 개별 제거하거나 전체 초기화
- 원본 와이어프레임의 파일명과 무결성 정보는 `docs/design-audit.md`의 "조사 대상과 한계"에서
  관리한다.
