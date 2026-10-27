# PhotoFirstReportForm

## 용도와 책임

목격 제보와 실종 동물 찾기에 공통으로 사용하는 사진 우선 2단계 폼이다. 1단계에서 사람이 아는
사진·장소·날짜·시간대를 받고, mock 이미지 분석 결과를 2단계 검토 행에 채운다. route, navigation,
실제 API 호출은 소유하지 않는다.

## Public props

- `mode`: `sighting | missing`. 문구, report type, 제목과 최종 CTA를 결정한다.
- `onSubmit`: mode에 맞는 report, features, photos를 전달한다.
- `analyzeImage`: 첫 사진을 분석하는 교체 가능한 adapter. 기본값은 mock analyzer다.
- `isSubmitting`, `errorMessage`: 외부 등록 흐름 상태다.

## 상태

- 1단계: 사진·장소·날짜·시간대가 모두 있어야 다음 버튼 활성화.
- 장소: 지도와 장소명 입력을 포함한 기존 위치 선택 섹션을 바로 보여준다.
- 분석 중: loading CTA, 중복 실행 차단.
- AI 검토: 모든 행이 접힌 채 시작하고 한 번에 한 행만 연다.
- 직접 입력: 분석 실패 배너를 표시하고 필수 species 행을 자동으로 펼친다. species 선택 후 제출
  가능하다.
- 부분 분석: AI가 species를 찾지 못해도 필수 species 행을 자동으로 펼치고 사용자가 선택하기 전까지
  제출을 막는다.
- 제출 중과 등록 오류.

## 접근성

- 검토 행은 native button과 `aria-expanded`, `aria-controls`를 사용한다.
- 분석 후 자동으로 2단계 제목에 focus를 옮겨 이전 CTA의 누름 상태를 해제한다.
- 상태는 `AI`, `수정함`, `확인하지 못했어요` 텍스트로도 전달한다.
- 비동기 상태는 Button의 `aria-busy`와 visible label을 사용한다.
- fieldset과 legend로 선택지 그룹 이름을 제공한다.
- 사진·장소 제목과 날짜·시간대의 개별 라벨에서 필수 여부를 같은 텍스트 스타일로 제공한다.
- 사진 제거 등 직접 조작 control은 최소 44px 영역을 확보하고 hover 입력 환경에서만 hover 상태를
  제공한다.

## 반응형

- 모바일은 단일 열과 하단 CTA를 사용한다.
- 하단 고정 CTA와 본문은 기기 safe-area를 포함해 서로 겹치지 않는 여백을 사용한다.
- 넓은 화면에서도 읽는 순서를 유지하고 본문 폭만 제한한다.
- 날짜와 시간대 control은 같은 높이·radius·focus 규격을 사용한다.
- 특징 행은 상태 열 너비를 고정해 AI·수정함·빈 상태에서도 열을 맞춘다.

## 범위 밖

- 실제 AI endpoint와 HTTP 계약
- route navigation, 인증, 등록·매칭 mutation
- 분석 점수와 품종 자동 선택
