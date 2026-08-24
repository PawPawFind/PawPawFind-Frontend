# Claude Design Audit

Claude Design 와이어프레임을 디자인 시스템 구현의 근거로 사용하기 위한 조사 기록입니다. 이 문서는
화면과 반복 패턴을 분류하는 자료이며, 여기에 적힌 후보가 곧바로 공용 컴포넌트나 확정 토큰이 되는
것은 아닙니다.

## 조사 대상과 한계

- 파일: `PawPawFind 와이어프레임 standalone (2).html`
- 크기: 5,087,605 bytes
- SHA-256: `2a4a2d75d499d239820ad8d630120042840eac942603af229009abfebe641714`
- 분석일: 2026-08-22
- 관련 Claude Design: `https://claude.ai/design/p/6c5747a2-9eae-4016-a2e5-b6a049902736`

HTML은 화면 템플릿, 상태 전환, Mock 데이터, 스타일을 포함한 자체 실행형 산출물입니다. 저장소에는
복사하지 않았으며 이 문서는 해당 파일의 코드 구조를 분석한 스냅샷입니다.

초기 감사에서는 브라우저 렌더링을 통한 픽셀 단위 검토를 완료하지 못했습니다. 구현 후 Storybook
정적 빌드와 자동 접근성 검사를 수행했으며, 실제 브라우저 수동 검토 여부는 완료 보고에 기록합니다.
다음 항목은 지속적인 후속 시각 검토 대상입니다.

- 실제 모바일·데스크톱 배치와 overflow
- hover와 animation의 최종 인상
- focus-visible과 키보드 이동
- 색상 대비와 확대 상태
- 실제 지도와 이미지가 들어왔을 때의 레이아웃

## 화면과 상태 인벤토리

| 영역           | 확인된 화면과 상태                                                             | 분류      |
| -------------- | ------------------------------------------------------------------------------ | --------- |
| 앱 탐색        | 상단 탐색, 사이드 drawer, 홈 복귀                                              | App shell |
| 목격 제보 지도 | 지도 placeholder, 목격·보호소 pin, pin 선택, 주변 제보 목록                    | Feature   |
| 목격 제보 목록 | 기본 목록, 필터 열기, 필터 그룹, 선택 필터 제거, 초기화, 빈 목록, 페이지네이션 | Feature   |
| 목격 제보 상세 | 기본 정보, 위치 안내, 예상 경로 열기·접기, 진입 경로별 뒤로가기                | Feature   |
| 목격 제보 등록 | 사진 slot, 동물 종류·크기·색상·특징 선택, CTA 비활성·활성, 등록 완료           | Feature   |
| 우리 아이 찾기 | 사진 slot, 동물 정보 입력, CTA 비활성·활성                                     | Feature   |
| AI 분석        | 세 단계 진행 상태와 reduced-motion 대응                                        | Feature   |
| 유사 동물 결과 | 출처 필터, 후보 목록, 유사도 bar, 전후 사진 비교                               | Feature   |
| 인증           | 로그인 bottom sheet, 카카오·Google 로그인, 나중에 하기                         | Feature   |
| 마이페이지     | 로그인 여부, 닉네임 변경·취소·저장, 로그아웃                                   | Feature   |

현재 상태 모델에서 확인된 주요 분기는 다음과 같습니다.

- 페이지: `sighting`, `feed`, `detail`, `report`, `match`, `settings`
- 찾기 단계: `form`, `analyzing`, `result`
- 제보 등록 단계: `form`, `done`
- overlay: drawer 열림, 로그인 sheet 열림
- 선택 상태: pin, filter, species, size, color, feature tag, result source

## Foundation 조사

### Color

아래 핵심 색상은 와이어프레임에서 반복 사용되며 현재 `src/styles/tokens.css`에도 반영돼 있습니다.

| 역할             | 값        | 와이어프레임 사용 빈도 | 판단                             |
| ---------------- | --------- | ---------------------: | -------------------------------- |
| border           | `#E4E7EB` |                     74 | 기존 토큰 유지                   |
| tertiary text    | `#6B7280` |                     63 | 기존 토큰 유지                   |
| background       | `#FFFFFF` |                     60 | 기존 토큰 유지                   |
| surface          | `#F4F5F7` |                     54 | 기존 토큰 유지                   |
| primary text     | `#16181D` |                     50 | 기존 토큰 유지                   |
| secondary text   | `#4B5563` |                     40 | 기존 토큰 유지                   |
| accent           | `#F59E0B` |                     34 | 기존 토큰 유지                   |
| selected surface | `#FEF3E2` |                     13 | 기존 토큰 유지                   |
| disabled/quiet   | `#C3C8CF` |                     11 | 토큰 후보                        |
| danger           | `#DC2626` |                      1 | 의미가 명확하므로 기존 토큰 유지 |

`#FEE500`은 카카오 로그인 버튼에만 사용됩니다. 제품 accent가 아니라 외부 브랜드 색상이므로 전역
색상 토큰에 합치지 않습니다. 동물 illustration의 갈색·회색도 콘텐츠 색상이므로 foundation으로
승격하지 않습니다.

### Typography

- 기본 글꼴: `Pretendard Variable`, Pretendard, system-ui fallback
- 본문·버튼: `15px`가 가장 많이 반복됨
- 설명·보조 정보: `13px`
- 작은 제목: `17px`, `19px`, `21px`
- 화면 제목: `clamp()`를 사용한 21–32px 범위
- 주요 weight: 400, 600, 700

현재 타입 토큰은 핵심 크기를 포괄합니다. 다만 와이어프레임의 여러 `clamp()` 값을 하나의
`--font-size-title`로 통합해도 되는지는 실제 화면 비교 후 결정합니다. 글자 크기만으로 heading
컴포넌트를 만들지 않습니다.

### Spacing

반복 간격은 `4`, `8`, `12`, `16`, `20`, `24`, `28`, `32px`를 중심으로 나타납니다. `6`, `10`,
`14px`도 작은 아이콘·내부 간격에서 사용됩니다.

우선 core spacing 후보는 다음으로 제한합니다.

```text
4 / 8 / 12 / 16 / 20 / 24 / 32
```

모든 숫자를 토큰으로 만들지 않습니다. `6`, `10`, `14`, `28px`가 여러 실제 컴포넌트에서 같은
의미로 재사용되는지 구현 과정에서 다시 확인합니다.

### Radius

| 값      | 주 사용처                       | 판단                      |
| ------- | ------------------------------- | ------------------------- |
| `8px`   | chip, 작은 control, pagination  | core 후보                 |
| `12px`  | button, input, card             | core 후보                 |
| `16px`  | 큰 surface, sheet, filter panel | core 후보                 |
| `999px` | pill, dot, progress             | full 후보                 |
| `10px`  | segmented tab                   | 컴포넌트 전용 값으로 보류 |

### Shadow

| 값                                 | 확인된 사용처              | 판단              |
| ---------------------------------- | -------------------------- | ----------------- |
| `0 1px 3px rgb(17 24 39 / 0.08)`   | 선택 tab                   | subtle 후보       |
| `0 2px 12px rgb(17 24 39 / 0.12)`  | 떠 있는 control, 선택 chip | floating 후보     |
| `0 -2px 16px rgb(17 24 39 / 0.08)` | bottom sheet               | overlay 전용 후보 |
| `0 0 0 1px rgb(17 24 39 / 0.12)`   | 비교 handle                | 컴포넌트 전용     |

shadow는 surface의 높이 체계가 합의되기 전까지 토큰으로 구현하지 않습니다.

### Motion and responsive evidence

- AI 분석 pulse와 bottom sheet 진입 animation이 있습니다.
- `prefers-reduced-motion: reduce` 대응이 확인됩니다.
- 명시적인 viewport breakpoint용 media query는 확인되지 않았습니다.
- grid의 `auto-fit`, `minmax()`, `clamp()` 등 유동형 배치는 사용됩니다.
- 모바일·데스크톱을 별도 상태로 확정하려면 렌더링 화면을 추가로 수집해야 합니다.

## Primitive 후보

| 후보              | 반복 근거                                                          | 현재 결정                                        |
| ----------------- | ------------------------------------------------------------------ | ------------------------------------------------ |
| Button            | CTA, 보조 행동, 저장·취소, pagination 등에서 동일 높이와 상태 반복 | 가장 먼저 spec 작성할 후보                       |
| Badge             | 출처와 보조 라벨에 반복, 기존 구현 존재                            | 유지하되 neutral 표현 필요성 재검토              |
| Selectable chip   | 필터, 특징, 색상, 결과 출처에서 선택 상태 반복                     | single/multi/removable 계약을 분리해 spec 검토   |
| Text input        | 제보 제목과 닉네임 입력에서 반복                                   | label, invalid, help text 근거를 더 모은 뒤 승격 |
| Segmented control | 동물 종류와 크기 선택에서 반복                                     | form 단일 선택 primitive 후보                    |
| Time band select  | 목격 제보와 실종 동물 찾기의 시간대 선택에서 반복                  | 단일 선택 custom dropdown으로 구현               |
| Photo slot        | 제보 등록과 우리 아이 찾기에서 같은 3-slot 구조 반복               | 실제 file input 계약 확정 전 feature-local 유지  |
| Dialog/sheet      | 로그인에서 overlay와 bottom sheet 사용                             | 한 사례뿐이므로 feature-local 유지               |
| Drawer            | 앱 메뉴 한 사례                                                    | app shell에 유지                                 |
| Pagination        | 목격 제보 목록 한 사례                                             | feature-local 유지                               |
| Progress          | AI 분석 단계 한 사례                                               | 찾기 feature에 유지                              |

### 공통화하지 않는 항목

- 지도 pin과 선택 preview
- 목격 제보 목록 item
- 목격·보호소 상세 정보
- AI 후보 card와 유사도 bar
- 사진 비교 slider
- 로그인 공급자 버튼의 브랜드 표현

이들은 표면 모양이 일부 비슷해도 도메인 데이터와 동작에 의존합니다. 재사용이 필요하면 먼저 같은
feature 안에서 추출하며 `src/components/ui`로 올리지 않습니다.

### Card에 대한 결정

흰 배경, border, radius를 가진 surface가 여러 번 등장하지만 카드의 의미와 상호작용은 서로
다릅니다. 현재는 범용 `Card` 컴포넌트를 만들지 않습니다. 공통성이 확인된 것은 foundation의 surface,
border, radius뿐입니다.

## Feature 컴포넌트 인벤토리

| Feature        | 로컬 컴포넌트 후보                                                            |
| -------------- | ----------------------------------------------------------------------------- |
| 목격 제보 지도 | map, map pin, selected sighting preview, nearby sighting list                 |
| 목격 제보 목록 | filter panel, active filter list, sighting list item, pagination              |
| 목격 제보 상세 | detail summary, information rows, location map, predicted route               |
| 제보 위치 선택 | Kakao map, fixed center pin, reverse geocoding, manual fallback               |
| 목격 제보 등록 | photo section, animal attributes, feature selector, completion view           |
| 우리 아이 찾기 | search form, analysis progress, result filter, candidate item, compare slider |
| 인증           | login sheet, provider actions                                                 |
| 설정           | account summary, nickname editor, sign-out action                             |

Feature 이름과 URL은 이 감사 문서에서 확정하지 않습니다. 제품 용어와 백엔드 계약을 확인한 뒤 별도
아키텍처 작업에서 결정합니다.

## 누락되거나 불명확한 상태

- 공통 control의 focus-visible 스타일
- 입력 오류와 validation message
- API loading, empty, error, retry의 실제 디자인
- dialog의 focus trap, Escape 닫기, 초기 focus
- file input의 허용 형식, 용량, 업로드 진행, 실패
- 긴 제목·지역명·태그와 이미지 오류
- 모바일·태블릿·데스크톱 breakpoint별 결과
- dark mode 필요 여부
- 카카오 지도 SDK의 실제 발급 키·등록 도메인에서 loading, 인증 실패와 할당량 초과 상태

이 상태를 추측해서 public props로 추가하지 않습니다. 기능 요구사항 또는 추가 디자인을 확보한 뒤
spec에 반영합니다.

## 권장 구현 순서

1. 현재 색상·타이포그래피 토큰과 화면의 차이를 시각적으로 검증합니다.
2. spacing과 radius 후보를 실제 두 화면 이상에서 대조합니다.
3. Button spec을 작성하고 필요한 상태만 확정합니다.
4. 선택 chip과 segmented control이 같은 책임인지 분리 검토합니다.
5. Text input의 label, invalid, help text 상태 디자인을 보완합니다.
6. 한 feature 화면에서 새 primitive를 적용하고 회귀를 확인합니다.
7. 두 번째 실제 사용처가 생긴 컴포넌트만 공용 영역에 유지합니다.
8. 반복 작업이 수작업 오류를 만들기 시작할 때 generator나 Skill을 검토합니다.

## 이번 감사에서 하지 않는 일

- 와이어프레임을 그대로 프로덕션 코드로 복사
- 모든 수치를 토큰으로 변환
- 범용 Card나 Form 추상화 생성
- 미확인 상태를 추측해 public API에 추가
- generator, Storybook, 별도 디자인 시스템 패키지 도입
