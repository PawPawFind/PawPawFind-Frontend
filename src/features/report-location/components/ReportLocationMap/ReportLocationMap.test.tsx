import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadKakaoMaps } from '../../kakao/loadKakaoMaps'
import type {
  KakaoLatLng,
  KakaoMap,
  KakaoMapOptions,
  KakaoMapsApi,
} from '../../kakao/kakaoMaps.types'
import { ReportLocationMap } from './ReportLocationMap'

vi.mock('../../kakao/loadKakaoMaps', () => ({ loadKakaoMaps: vi.fn() }))

describe('ReportLocationMap', () => {
  beforeEach(() => vi.mocked(loadKakaoMaps).mockReset())

  it('키가 없으면 좌표와 지도 fallback을 표시한다', () => {
    render(
      <ReportLocationMap
        appKey=""
        areaText="서울 마포구 연남동"
        latitude={37.56}
        longitude={126.92}
      />,
    )

    expect(loadKakaoMaps).not.toHaveBeenCalled()
    expect(screen.getByRole('region', { name: /위도 37.56, 경도 126.92/ })).toBeInTheDocument()
    expect(screen.queryByText('위도 37.56 · 경도 126.92')).not.toBeInTheDocument()
  })

  it('좌표를 중심으로 지도와 마커, 반경 원을 만든다', async () => {
    const markerConstructor = vi.fn()
    const circleConstructor = vi.fn()
    class FakeLatLng implements KakaoLatLng {
      constructor(
        private latitude: number,
        private longitude: number,
      ) {}
      getLat() {
        return this.latitude
      }
      getLng() {
        return this.longitude
      }
    }
    class FakeMap implements KakaoMap {
      constructor(
        container: HTMLElement,
        private options: KakaoMapOptions,
      ) {
        container.dataset.mapReady = 'true'
      }
      getCenter() {
        return this.options.center
      }
      relayout() {
        return undefined
      }
      setCenter(position: KakaoLatLng) {
        this.options.center = position
      }
    }
    const mapsApi = {
      LatLng: FakeLatLng,
      Map: FakeMap,
      Marker: class {
        constructor(options: unknown) {
          markerConstructor(options)
        }
        setMap() {
          return undefined
        }
      },
      Circle: class {
        constructor(options: unknown) {
          circleConstructor(options)
        }
        setMap() {
          return undefined
        }
      },
      event: { addListener: () => undefined, removeListener: () => undefined },
      load: (callback: () => void) => callback(),
      services: { Geocoder: class {}, Status: { OK: 'OK' } },
    } as unknown as KakaoMapsApi
    vi.mocked(loadKakaoMaps).mockResolvedValue(mapsApi)

    const { container } = render(
      <ReportLocationMap
        appKey="key"
        areaText="연남동"
        latitude={37.56}
        longitude={126.92}
        radiusM={300}
      />,
    )

    await waitFor(() =>
      expect(container.querySelector('[data-map-ready="true"]')).toBeInTheDocument(),
    )
    expect(markerConstructor).toHaveBeenCalledOnce()
    expect(circleConstructor).toHaveBeenCalledWith(expect.objectContaining({ radius: 300 }))
  })

  it('읽기 전용 지도에서는 이동과 확대 입력을 비활성화한다', async () => {
    let mapOptions: KakaoMapOptions | undefined
    class FakeLatLng implements KakaoLatLng {
      getLat() {
        return 37.56
      }
      getLng() {
        return 126.92
      }
    }
    class FakeMap implements KakaoMap {
      constructor(_container: HTMLElement, options: KakaoMapOptions) {
        mapOptions = options
      }
      getCenter() {
        return mapOptions!.center
      }
      relayout() {
        return undefined
      }
      setCenter() {
        return undefined
      }
    }
    vi.mocked(loadKakaoMaps).mockResolvedValue({
      LatLng: FakeLatLng,
      Map: FakeMap,
      event: { addListener: () => undefined, removeListener: () => undefined },
      load: (callback: () => void) => callback(),
      services: { Geocoder: class {}, Status: { OK: 'OK' } },
    } as unknown as KakaoMapsApi)

    render(
      <ReportLocationMap
        appKey="key"
        areaText="연남동"
        interactive={false}
        latitude={37.56}
        longitude={126.92}
      />,
    )

    await waitFor(() => expect(mapOptions).toBeDefined())
    expect(mapOptions).toEqual(
      expect.objectContaining({
        draggable: false,
        scrollwheel: false,
        disableDoubleClick: true,
        disableDoubleClickZoom: true,
        keyboardShortcuts: false,
      }),
    )
  })
})
