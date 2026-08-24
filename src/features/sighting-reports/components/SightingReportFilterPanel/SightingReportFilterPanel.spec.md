# SightingReportFilterPanel

목격 제보 목록의 도메인 필터 그룹을 아코디언으로 표시한다. 선택 상태는 부모가 관리하고 panel은
그룹별 disclosure button과 `SelectableChip`을 조합한다. 한 번에 한 그룹만 펼치며, 접힌 행 오른쪽에는
해당 그룹의 선택값을 쉼표로 요약한다. 같은 행을 다시 누르면 접힌다.

지원 상태: 선택 없음/있음, 그룹 펼침/접힘, disabled, 긴 option과 좁은 너비. URL 동기화와 API query
변환은 페이지 책임으로 둔다.

## 접근성

- 각 그룹 제목은 `button`이며 `aria-expanded`와 `aria-controls`로 옵션 영역을 연결한다.
- 옵션은 기존 `SelectableChip`의 `aria-pressed` 선택 상태를 사용한다.
- disabled이면 그룹 열기와 옵션 선택을 모두 비활성화한다.

## 근거

- 저장소 근거: `docs/design-audit.md`의 "화면과 상태 인벤토리"와 "Feature 컴포넌트 인벤토리"
  섹션
- 확인된 흐름: 목격 제보 목록의 필터 열기, 그룹별 선택, 필터 초기화
- 원본 와이어프레임의 파일명과 무결성 정보는 `docs/design-audit.md`의 "조사 대상과 한계"에서
  관리한다.
