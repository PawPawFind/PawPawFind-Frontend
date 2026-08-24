# ReportLocationPicker

## 책임

목격·실종 제보 입력에서 카카오 지도의 중심 위치를 장소와 WGS84 위·경도로 변환하는 feature
컴포넌트다. 지도 제공사와 제보 위치 입력 흐름을 알기 때문에 공용 UI primitive로 승격하지 않는다.

## Public API

```ts
interface ReportLocationValue {
  happenPlace: string
  latitude: string
  longitude: string
}

interface ReportLocationPickerProps {
  heading: string
  description: string
  value: ReportLocationValue
  onValueChange: (value: ReportLocationValue) => void
  appKey?: string
  className?: string
}
```

## 동작

- 기본 중심은 `서울특별시 강남구 테헤란로4길 29, 4층(역삼동, 정우씨티)`이며 목격·실종
  입력 폼도 같은 주소와 WGS84 좌표를 초기 controlled value로 사용한다.
- 지도 drag가 끝나면 중심의 위·경도를 읽고 카카오 `services.Geocoder.coord2Address`로 주소를
  조회한다.
- 현재 위치 버튼을 누르면 브라우저에 위치 권한을 요청하고, 성공하면 지도 중심을 현재 위치로
  이동한 뒤 drag와 동일하게 좌표와 주소를 갱신한다.
- 현재 위치를 확인하지 못하면 입력 페이지의 상태 영역에 진한 주황 안내를 표시하고 기존 지도
  이동은 계속 사용할 수 있다.
- 도로명 주소가 있으면 우선 사용하고, 없으면 지번 주소를 사용한다.
- 주소 조회가 실패하더라도 좌표는 보존하고 사용자가 장소명을 직접 입력할 수 있게 한다.
- 장소명 입력은 좌표를 변경하지 않는다.
- 유효한 좌표를 외부에서 전달하면 해당 위치를 초기 중심으로 사용한다.

## 상태

- SDK loading / ready / missing key / load failure
- 현재 위치 확인 전 / 확인 중 / 확인 실패
- 주소 조회 중 / 조회 실패 / 선택 완료
- 장소명 입력 닫힘 / 열림

## 접근성

- 지도 영역은 이름이 있는 `region`으로 노출한다.
- SDK, 현재 위치 확인, 주소 조회 상태는 지도 바깥의 `aria-live="polite"` 영역에서 알린다.
- 지도 사용 준비가 끝난 평상시에는 별도의 상태 문구를 표시하지 않는다.
- 현재 위치는 사용자가 이름이 있는 native `button`을 누른 경우에만 요청한다.
- 장소명 입력 열기·닫기는 native `button`과 `aria-expanded`, `aria-controls`를 사용한다.

## 제외

- 장소 키워드 검색과 자동완성
- 위·경도 직접 입력
- 지도에 여러 marker 표시
- 공개용 좌표 축약·마스킹
- 제보 생성 API 호출

## 근거

- 카카오 지도 Web API의 `Map`, `dragend`, `services.Geocoder.coord2Address`
- 목격 제보 입력과 실종 동물 찾기 입력의 공통 `happenPlace`, `latitude`, `longitude` 계약
