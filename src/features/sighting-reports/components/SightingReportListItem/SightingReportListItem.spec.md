# SightingReportListItem

목격 제보 목록의 한 항목을 제목, 종류, 장소, 날짜, 특징 태그로 요약한다. API 타입을 늘리지 않고
feature-local view model을 받는다. 상세 이동 계약이 있는 사용처만 `onSelect`를 전달하며, 그때 전체
항목을 선택할 수 있는 별도 native button을 `article` 위에 배치한다. 제목, 메타데이터, 특징 목록은
button 밖에 유지해 유효한 HTML 구조와 문서 의미를 보존한다. 선택 button의 접근 가능한 이름은 제보
제목과 "상세 보기" 문구로 구성한다. 이미지 URL·오류 처리와 상세 route는 계약이 없어 제외한다.

장소에는 위치 핀, 날짜에는 달력 SVG 아이콘을 장식용으로 표시한다. 아이콘은 바로 뒤의 텍스트와
중복해서 읽히지 않도록 접근성 트리에서 제외한다.

지원 상태: 기본, 긴 문구, 태그 유무, 선택 가능. loading/error/empty는 목록 화면의 책임이다.

## 접근성과 키보드

- 제보 한 건은 항상 `article`이며 제목은 heading, 특징은 list 의미를 유지한다.
- `onSelect`가 있을 때만 전체 영역을 덮는 별도 native `button`을 제공한다.
- 선택 button은 Enter와 Space로 실행할 수 있고 `focus-visible` outline을 표시한다.

## 근거

- 저장소 근거: `docs/design-audit.md`의 "화면과 상태 인벤토리", "공통화하지 않는 항목",
  "Feature 컴포넌트 인벤토리" 섹션
- 확인된 정보 계층: 제목, 동물 종류, 장소, 날짜, 특징 태그
- 원본 와이어프레임의 파일명과 무결성 정보는 `docs/design-audit.md`의 "조사 대상과 한계"에서
  관리한다.
