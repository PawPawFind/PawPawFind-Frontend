import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadKakaoMaps } from '../../kakao/loadKakaoMaps'
import type {
  KakaoGeocoder,
  KakaoLatLng,
  KakaoMap,
  KakaoMapOptions,
  KakaoMapsApi,
} from '../../kakao/kakaoMaps.types'
import { ReportLocationPicker, type ReportLocationValue } from './ReportLocationPicker'

vi.mock('../../kakao/loadKakaoMaps', () => ({ loadKakaoMaps: vi.fn() }))

const initialValue: ReportLocationValue = {
  happenPlace: '',
  latitude: '',
  longitude: '',
}

const originalGeolocationDescriptor = Object.getOwnPropertyDescriptor(
  window.navigator,
  'geolocation',
)

function Example({ appKey = '' }: { appKey?: string }) {
  const [value, setValue] = useState(initialValue)

  return (
    <>
      <ReportLocationPicker
        appKey={appKey}
        description="지도를 움직여 위치를 선택해주세요."
        heading="발견 장소"
        onValueChange={setValue}
        value={value}
      />
      <output data-testid="location-value">{JSON.stringify(value)}</output>
    </>
  )
}

describe('ReportLocationPicker', () => {
  beforeEach(() => {
    vi.mocked(loadKakaoMaps).mockReset()
  })

  afterEach(() => {
    if (originalGeolocationDescriptor) {
      Object.defineProperty(window.navigator, 'geolocation', originalGeolocationDescriptor)
      return
    }

    Reflect.deleteProperty(window.navigator, 'geolocation')
  })

  it('키가 없으면 지도 요청 없이 장소명을 직접 입력할 수 있다', async () => {
    const user = userEvent.setup()
    render(<Example />)

    expect(loadKakaoMaps).not.toHaveBeenCalled()
    const mapRegion = screen.getByRole('region', { name: '발견 장소 지도' })
    const mapStatus = screen.getByText(/카카오맵 키를 설정하면/)

    expect(mapRegion).toBeInTheDocument()
    expect(mapStatus).toHaveTextContent(/카카오맵 키를 설정하면/)
    expect(mapRegion).not.toContainElement(mapStatus)

    const addPlaceButton = screen.getByRole('button', { name: '장소명 입력 열기' })
    expect(addPlaceButton).toHaveAttribute('aria-expanded', 'false')
    await user.click(addPlaceButton)
    expect(addPlaceButton).toHaveAttribute('aria-expanded', 'true')
    await user.type(screen.getByRole('textbox', { name: /장소명 또는 주소/ }), '연남동 골목')

    expect(screen.queryByRole('spinbutton', { name: /위도|경도/ })).not.toBeInTheDocument()

    expect(screen.getByTestId('location-value')).toHaveTextContent(
      JSON.stringify({
        happenPlace: '연남동 골목',
        latitude: '',
        longitude: '',
      }),
    )
  })

  it('지도 이동이 끝나면 중심 좌표의 도로명 주소를 controlled value로 전달한다', async () => {
    let dragEndHandler: (() => void) | undefined
    let initialMapCenter: KakaoLatLng | undefined
    let setMapCenter: ((position: KakaoLatLng) => void) | undefined

    class FakeLatLng implements KakaoLatLng {
      constructor(
        private readonly latitude: number,
        private readonly longitude: number,
      ) {}

      getLat() {
        return this.latitude
      }

      getLng() {
        return this.longitude
      }
    }

    class FakeMap implements KakaoMap {
      private center: KakaoLatLng

      constructor(container: HTMLElement, options: KakaoMapOptions) {
        container.dataset.mapReady = 'true'
        this.center = options.center
        initialMapCenter = options.center
        setMapCenter = (position) => {
          this.center = position
        }
      }

      getCenter() {
        return this.center
      }

      relayout() {
        return undefined
      }

      setCenter(position: KakaoLatLng) {
        this.center = position
      }
    }

    class FakeGeocoder implements KakaoGeocoder {
      coord2Address(
        _longitude: number,
        _latitude: number,
        callback: Parameters<KakaoGeocoder['coord2Address']>[2],
      ) {
        callback(
          [
            {
              address: { address_name: '서울 마포구 연남동 1' },
              road_address: { address_name: '서울 마포구 동교로 27길 14' },
            },
          ],
          'OK',
        )
      }
    }

    const mapsApi: KakaoMapsApi = {
      LatLng: FakeLatLng,
      Map: FakeMap,
      event: {
        addListener: (_target, type, handler) => {
          if (type === 'dragend') dragEndHandler = handler
        },
        removeListener: () => undefined,
      },
      load: (callback) => callback(),
      services: {
        Geocoder: FakeGeocoder,
        Status: { OK: 'OK' },
      },
    }

    vi.mocked(loadKakaoMaps).mockResolvedValue(mapsApi)
    render(<Example appKey="test-key" />)

    await waitFor(() =>
      expect(screen.getByRole('button', { name: '현재 위치로 이동' })).toBeEnabled(),
    )
    expect(initialMapCenter?.getLat()).toBe(37.4965607)
    expect(initialMapCenter?.getLng()).toBe(127.0305335)

    act(() => {
      setMapCenter?.(new FakeLatLng(37.5631234, 126.9256789))
      dragEndHandler?.()
    })

    await waitFor(() =>
      expect(screen.getByTestId('location-value')).toHaveTextContent(
        JSON.stringify({
          happenPlace: '서울 마포구 동교로 27길 14',
          latitude: '37.5631234',
          longitude: '126.9256789',
        }),
      ),
    )
  })

  it('현재 위치 버튼을 누르면 권한을 요청하고 지도 중심의 좌표와 주소를 갱신한다', async () => {
    class FakeLatLng implements KakaoLatLng {
      constructor(
        private readonly latitude: number,
        private readonly longitude: number,
      ) {}

      getLat() {
        return this.latitude
      }

      getLng() {
        return this.longitude
      }
    }

    class FakeMap implements KakaoMap {
      private center: KakaoLatLng

      constructor(_container: HTMLElement, options: KakaoMapOptions) {
        this.center = options.center
      }

      getCenter() {
        return this.center
      }

      relayout() {
        return undefined
      }

      setCenter(position: KakaoLatLng) {
        this.center = position
      }
    }

    class FakeGeocoder implements KakaoGeocoder {
      coord2Address(
        longitude: number,
        latitude: number,
        callback: Parameters<KakaoGeocoder['coord2Address']>[2],
      ) {
        expect({ latitude, longitude }).toEqual({
          latitude: 37.5631234,
          longitude: 126.9256789,
        })
        callback(
          [
            {
              address: { address_name: '서울 마포구 연남동 1' },
              road_address: { address_name: '서울 마포구 동교로 27길 14' },
            },
          ],
          'OK',
        )
      }
    }

    const mapsApi: KakaoMapsApi = {
      LatLng: FakeLatLng,
      Map: FakeMap,
      event: {
        addListener: () => undefined,
        removeListener: () => undefined,
      },
      load: (callback) => callback(),
      services: {
        Geocoder: FakeGeocoder,
        Status: { OK: 'OK' },
      },
    }
    const position: GeolocationPosition = {
      coords: {
        accuracy: 5,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        latitude: 37.5631234,
        longitude: 126.9256789,
        speed: null,
        toJSON: () => ({
          accuracy: 5,
          latitude: 37.5631234,
          longitude: 126.9256789,
        }),
      },
      timestamp: 0,
      toJSON: () => ({
        coords: {
          accuracy: 5,
          latitude: 37.5631234,
          longitude: 126.9256789,
        },
        timestamp: 0,
      }),
    }
    const getCurrentPosition = vi.fn<Geolocation['getCurrentPosition']>((success) => {
      success(position)
    })

    Object.defineProperty(window.navigator, 'geolocation', {
      configurable: true,
      value: {
        clearWatch: vi.fn(),
        getCurrentPosition,
        watchPosition: vi.fn(() => 0),
      } satisfies Geolocation,
    })
    vi.mocked(loadKakaoMaps).mockResolvedValue(mapsApi)
    const user = userEvent.setup()
    render(<Example appKey="test-key" />)

    const currentLocationButton = await screen.findByRole('button', {
      name: '현재 위치로 이동',
    })
    await waitFor(() => expect(currentLocationButton).toBeEnabled())
    await user.click(currentLocationButton)

    expect(getCurrentPosition).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), {
      enableHighAccuracy: true,
      maximumAge: 60_000,
      timeout: 10_000,
    })
    await waitFor(() =>
      expect(screen.getByTestId('location-value')).toHaveTextContent(
        JSON.stringify({
          happenPlace: '서울 마포구 동교로 27길 14',
          latitude: '37.5631234',
          longitude: '126.9256789',
        }),
      ),
    )
  })
})
