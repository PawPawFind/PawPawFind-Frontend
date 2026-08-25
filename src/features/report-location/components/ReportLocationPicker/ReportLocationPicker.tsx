import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { TextInput } from '@/components/ui/text-input'
import { DEFAULT_REPORT_LOCATION } from '@/types/report'
import { loadKakaoMaps } from '../../kakao/loadKakaoMaps'
import type { KakaoMap, KakaoMapsApi } from '../../kakao/kakaoMaps.types'
import './ReportLocationPicker.css'

const DEFAULT_CENTER = {
  latitude: Number(DEFAULT_REPORT_LOCATION.latitude),
  longitude: Number(DEFAULT_REPORT_LOCATION.longitude),
}

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

type MapState = 'loading' | 'ready' | 'missing-key' | 'error'
type AddressState = 'idle' | 'loading' | 'error'
type GeolocationState = 'idle' | 'loading' | 'error'

function parseCoordinate(value: string, minimum: number, maximum: number) {
  const coordinate = Number(value)
  return value !== '' &&
    Number.isFinite(coordinate) &&
    coordinate >= minimum &&
    coordinate <= maximum
    ? coordinate
    : undefined
}

function formatCoordinate(value: number) {
  return value.toFixed(7).replace(/\.?0+$/, '')
}

function getMapGuide(
  mapState: MapState,
  addressState: AddressState,
  geolocationState: GeolocationState,
) {
  if (mapState === 'loading') return '카카오맵을 불러오는 중이에요.'
  if (mapState === 'missing-key') return '카카오맵 키를 설정하면 지도에서 위치를 선택할 수 있어요.'
  if (mapState === 'error') return '지도를 불러오지 못했어요. 잠시 후 다시 시도해주세요.'
  if (geolocationState === 'loading') return '현재 위치를 확인하고 있어요.'
  if (geolocationState === 'error') {
    return '현재 위치를 확인하지 못했어요. 지도를 직접 움직여 선택해주세요.'
  }
  if (addressState === 'loading') return '선택한 위치의 주소를 확인하고 있어요.'
  if (addressState === 'error') return '주소를 찾지 못했어요. 장소명을 직접 입력해주세요.'
  return ''
}

export function ReportLocationPicker({
  appKey,
  className,
  description,
  heading,
  onValueChange,
  value,
}: ReportLocationPickerProps) {
  const resolvedAppKey = appKey ?? import.meta.env.VITE_KAKAO_MAP_APP_KEY ?? ''
  const [mapState, setMapState] = useState<MapState>(resolvedAppKey ? 'loading' : 'missing-key')
  const [addressState, setAddressState] = useState<AddressState>('idle')
  const [geolocationState, setGeolocationState] = useState<GeolocationState>('idle')
  const [isPlaceInputOpen, setIsPlaceInputOpen] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<KakaoMap>()
  const mapsApiRef = useRef<KakaoMapsApi>()
  const selectMapCenterRef = useRef<() => void>()
  const latestValueRef = useRef(value)
  const onValueChangeRef = useRef(onValueChange)
  const addressRequestIdRef = useRef(0)
  const geolocationRequestIdRef = useRef(0)
  const id = useId()
  const headingId = `${id}-heading`
  const placeInputId = `${id}-place-input`
  const classes = ['report-location-picker', className].filter(Boolean).join(' ')

  useEffect(() => {
    latestValueRef.current = value
  }, [value])

  useEffect(() => {
    onValueChangeRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    if (!resolvedAppKey) {
      setMapState('missing-key')
      return
    }

    const container = mapContainerRef.current
    if (!container) return

    let active = true
    let map: KakaoMap | undefined
    let maps: KakaoMapsApi | undefined
    let handleDragEnd: (() => void) | undefined

    setMapState('loading')

    void loadKakaoMaps(resolvedAppKey)
      .then((loadedMaps) => {
        if (!active) return

        const currentValue = latestValueRef.current
        const initialLatitude =
          parseCoordinate(currentValue.latitude, -90, 90) ?? DEFAULT_CENTER.latitude
        const initialLongitude =
          parseCoordinate(currentValue.longitude, -180, 180) ?? DEFAULT_CENTER.longitude
        const geocoder = new loadedMaps.services.Geocoder()

        maps = loadedMaps
        map = new loadedMaps.Map(container, {
          center: new loadedMaps.LatLng(initialLatitude, initialLongitude),
          level: 4,
        })
        mapsApiRef.current = loadedMaps
        mapRef.current = map

        handleDragEnd = () => {
          if (!map) return

          setGeolocationState('idle')
          const center = map.getCenter()
          const latitude = formatCoordinate(center.getLat())
          const longitude = formatCoordinate(center.getLng())
          const requestId = ++addressRequestIdRef.current
          const coordinateValue = {
            ...latestValueRef.current,
            latitude,
            longitude,
          }

          latestValueRef.current = coordinateValue
          onValueChangeRef.current(coordinateValue)
          setAddressState('loading')

          geocoder.coord2Address(Number(longitude), Number(latitude), (result, status) => {
            if (!active || requestId !== addressRequestIdRef.current) return

            const addressResult = result[0]
            const address =
              addressResult?.road_address?.address_name ?? addressResult?.address?.address_name

            if (status !== loadedMaps.services.Status.OK || !address) {
              setAddressState('error')
              setIsPlaceInputOpen(true)
              return
            }

            const nextValue = { ...coordinateValue, happenPlace: address }
            latestValueRef.current = nextValue
            onValueChangeRef.current(nextValue)
            setAddressState('idle')
          })
        }

        selectMapCenterRef.current = handleDragEnd
        loadedMaps.event.addListener(map, 'dragend', handleDragEnd)
        setMapState('ready')
      })
      .catch(() => {
        if (!active) return
        setMapState('error')
      })

    return () => {
      active = false
      addressRequestIdRef.current += 1
      geolocationRequestIdRef.current += 1

      if (maps && map && handleDragEnd) {
        maps.event.removeListener(map, 'dragend', handleDragEnd)
      }

      if (mapRef.current === map) {
        mapRef.current = undefined
        mapsApiRef.current = undefined
        selectMapCenterRef.current = undefined
      }
    }
  }, [resolvedAppKey])

  useEffect(() => {
    if (mapState !== 'ready') return

    const map = mapRef.current
    const maps = mapsApiRef.current
    const latitude = parseCoordinate(value.latitude, -90, 90)
    const longitude = parseCoordinate(value.longitude, -180, 180)

    if (!map || !maps || latitude === undefined || longitude === undefined) return

    const center = map.getCenter()
    if (center.getLat() === latitude && center.getLng() === longitude) return

    map.setCenter(new maps.LatLng(latitude, longitude))
  }, [mapState, value.latitude, value.longitude])

  const updateValue = (nextValue: ReportLocationValue) => {
    latestValueRef.current = nextValue
    onValueChange(nextValue)
  }

  const moveToCurrentLocation = () => {
    if (mapState !== 'ready') return

    const geolocation = navigator.geolocation
    if (!geolocation) {
      setGeolocationState('error')
      return
    }

    const requestId = ++geolocationRequestIdRef.current
    setGeolocationState('loading')

    geolocation.getCurrentPosition(
      ({ coords }) => {
        if (requestId !== geolocationRequestIdRef.current) return

        const map = mapRef.current
        const maps = mapsApiRef.current
        const latitude = parseCoordinate(String(coords.latitude), -90, 90)
        const longitude = parseCoordinate(String(coords.longitude), -180, 180)

        if (!map || !maps || latitude === undefined || longitude === undefined) {
          setGeolocationState('error')
          return
        }

        map.setCenter(new maps.LatLng(latitude, longitude))
        selectMapCenterRef.current?.()
      },
      () => {
        if (requestId !== geolocationRequestIdRef.current) return
        setGeolocationState('error')
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60_000,
        timeout: 10_000,
      },
    )
  }

  return (
    <section aria-labelledby={headingId} className={classes}>
      <div>
        <h2 id={headingId}>{heading}</h2>
        <p className="report-location-picker__help">{description}</p>
        <p
          aria-live="polite"
          className={`report-location-picker__status${
            geolocationState === 'error' ? ' report-location-picker__status--highlight' : ''
          }`}
          role="status"
        >
          {getMapGuide(mapState, addressState, geolocationState)}
        </p>
      </div>

      <div aria-label={`${heading} 지도`} className="report-location-picker__map" role="region">
        <div className="report-location-picker__map-canvas" ref={mapContainerRef} />
        {mapState !== 'ready' && (
          <span aria-hidden="true" className="report-location-picker__map-grid" />
        )}
        <button
          aria-label={geolocationState === 'loading' ? '현재 위치 확인 중' : '현재 위치로 이동'}
          className="report-location-picker__current-location"
          disabled={mapState !== 'ready' || geolocationState === 'loading'}
          onClick={moveToCurrentLocation}
          title="현재 위치로 이동"
          type="button"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            <circle cx="12" cy="12" r="7" />
          </svg>
        </button>
        <span aria-hidden="true" className="report-location-picker__map-radius" />
        <svg aria-hidden="true" className="report-location-picker__map-pin" viewBox="0 0 48 56">
          <path
            d="M24 53S43 34.5 43 20A19 19 0 1 0 5 20c0 14.5 19 33 19 33Z"
            fill="currentColor"
            stroke="#9a5700"
            strokeWidth="2"
          />
          <circle cx="24" cy="20" fill="white" r="6" />
        </svg>
        <span aria-hidden="true" className="report-location-picker__map-pin-shadow" />
        <span className="report-location-picker__map-address">
          {value.happenPlace || '선택한 위치의 주소가 여기에 표시돼요'}
        </span>
      </div>

      <div className="report-location-picker__place-card">
        <div className="report-location-picker__place-heading">
          <button
            aria-controls={placeInputId}
            aria-expanded={isPlaceInputOpen}
            aria-label="장소명 입력 열기"
            className="report-location-picker__place-add"
            onClick={() => setIsPlaceInputOpen(true)}
            type="button"
          >
            +
          </button>
          <div>
            <strong>이 주소에 대한 장소명 입력하기</strong>
            <span>{value.happenPlace || '선택한 위치의 주소가 여기에 표시돼요'}</span>
          </div>
          <button
            aria-controls={placeInputId}
            aria-expanded={isPlaceInputOpen}
            className="report-location-picker__place-toggle"
            onClick={() => setIsPlaceInputOpen((current) => !current)}
            type="button"
          >
            {isPlaceInputOpen ? '닫기' : '입력'}
          </button>
        </div>

        {isPlaceInputOpen && (
          <div className="report-location-picker__place-input-row" id={placeInputId}>
            <TextInput
              containerClassName="report-location-picker__place-input"
              label="장소명 또는 주소"
              name="happenPlace"
              onChange={(event) =>
                updateValue({ ...latestValueRef.current, happenPlace: event.target.value })
              }
              placeholder="예: 경의선숲길 3번 출입구"
              required
              value={value.happenPlace}
            />
            <Button onClick={() => setIsPlaceInputOpen(false)} type="button">
              확인
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

export type { ReportLocationPickerProps, ReportLocationValue }
