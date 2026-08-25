import { useEffect, useRef, useState } from 'react'
import { loadKakaoMaps } from '../../kakao/loadKakaoMaps'
import type { KakaoCircle, KakaoMarker } from '../../kakao/kakaoMaps.types'
import './ReportLocationMap.css'

interface ReportLocationMapProps {
  areaText: string
  latitude: number
  longitude: number
  radiusM?: number
  appKey?: string
  interactive?: boolean
}

type MapState = 'loading' | 'ready' | 'missing-key' | 'error'

export function ReportLocationMap({
  appKey,
  areaText,
  latitude,
  longitude,
  radiusM = 0,
  interactive = true,
}: ReportLocationMapProps) {
  const resolvedAppKey = appKey ?? import.meta.env.VITE_KAKAO_MAP_APP_KEY ?? ''
  const [mapState, setMapState] = useState<MapState>(resolvedAppKey ? 'loading' : 'missing-key')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!resolvedAppKey) {
      setMapState('missing-key')
      return
    }

    const container = containerRef.current
    if (!container) return
    let active = true
    let marker: KakaoMarker | undefined
    let circle: KakaoCircle | undefined

    setMapState('loading')
    void loadKakaoMaps(resolvedAppKey)
      .then((maps) => {
        if (!active) return
        const position = new maps.LatLng(latitude, longitude)
        const map = new maps.Map(container, {
          center: position,
          level: 4,
          draggable: interactive,
          scrollwheel: interactive,
          disableDoubleClick: !interactive,
          disableDoubleClickZoom: !interactive,
          keyboardShortcuts: interactive,
        })
        if (maps.Marker) marker = new maps.Marker({ map, position })
        if (radiusM > 0 && maps.Circle) {
          circle = new maps.Circle({
            center: position,
            radius: radiusM,
            strokeWeight: 1,
            strokeColor: '#f59e0b',
            strokeOpacity: 0.45,
            fillColor: '#f59e0b',
            fillOpacity: 0.12,
          })
          circle.setMap(map)
        }
        setMapState('ready')
      })
      .catch(() => {
        if (active) setMapState('error')
      })

    return () => {
      active = false
      marker?.setMap(null)
      circle?.setMap(null)
    }
  }, [interactive, latitude, longitude, radiusM, resolvedAppKey])

  const statusText =
    mapState === 'loading'
      ? '카카오맵을 불러오는 중입니다.'
      : mapState === 'missing-key'
        ? '카카오맵 키가 없어 위치를 미리보기로 표시합니다.'
        : mapState === 'error'
          ? '카카오맵을 불러오지 못해 위치를 미리보기로 표시합니다.'
          : ''

  return (
    <div className="report-location-map">
      <div
        aria-label={`${areaText}, 위도 ${latitude}, 경도 ${longitude}`}
        className="report-location-map__viewport"
        role="region"
      >
        <div className="report-location-map__canvas" ref={containerRef} />
        {mapState !== 'ready' && <span aria-hidden="true" className="report-location-map__grid" />}
      </div>
      {statusText && <p role="status">{statusText}</p>}
    </div>
  )
}

export type { ReportLocationMapProps }
