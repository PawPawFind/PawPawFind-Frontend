import { useEffect, useRef, useState } from 'react'
import { loadKakaoMaps } from '@/features/report-location/kakao/loadKakaoMaps'
import type { KakaoCircle, KakaoMarker } from '@/features/report-location/kakao/kakaoMaps.types'
import type { SearchAreaItem } from '../../types'
import { priorityColorForRank } from './priorityColor'
import './SearchAreaRecommendationMap.css'

interface SearchAreaRecommendationMapProps {
  areas: SearchAreaItem[]
  appKey?: string
}

type MapState = 'loading' | 'ready' | 'missing-key' | 'error'

export function SearchAreaRecommendationMap({ appKey, areas }: SearchAreaRecommendationMapProps) {
  const resolvedAppKey = appKey ?? import.meta.env.VITE_KAKAO_MAP_APP_KEY ?? ''
  const [mapState, setMapState] = useState<MapState>(resolvedAppKey ? 'loading' : 'missing-key')
  const containerRef = useRef<HTMLDivElement>(null)
  const primaryArea = areas[0]

  useEffect(() => {
    if (!resolvedAppKey || !primaryArea) {
      setMapState(resolvedAppKey ? 'error' : 'missing-key')
      return
    }

    const container = containerRef.current
    if (!container) return
    let active = true
    const markers: KakaoMarker[] = []
    const circles: KakaoCircle[] = []

    setMapState('loading')
    void loadKakaoMaps(resolvedAppKey)
      .then((maps) => {
        if (!active) return
        const center = new maps.LatLng(primaryArea.center.latitude, primaryArea.center.longitude)
        const map = new maps.Map(container, {
          center,
          level: 6,
          draggable: true,
          scrollwheel: true,
        })

        areas.forEach((area) => {
          const position = new maps.LatLng(area.center.latitude, area.center.longitude)
          const color = priorityColorForRank(area.rank)

          if (maps.Marker) markers.push(new maps.Marker({ map, position }))

          if (maps.Circle) {
            const circle = new maps.Circle({
              center: position,
              radius: area.radiusMeters,
              strokeWeight: 2,
              strokeColor: color,
              strokeOpacity: 0.8,
              fillColor: color,
              fillOpacity: 0.18,
            })
            circle.setMap(map)
            circles.push(circle)
          }
        })

        setMapState('ready')
      })
      .catch(() => {
        if (active) setMapState('error')
      })

    return () => {
      active = false
      markers.forEach((marker) => marker.setMap(null))
      circles.forEach((circle) => circle.setMap(null))
    }
  }, [areas, primaryArea, resolvedAppKey])

  const statusText =
    mapState === 'loading'
      ? '카카오맵을 불러오는 중입니다.'
      : mapState === 'missing-key'
        ? '카카오맵 키가 없어 지도를 표시할 수 없어요.'
        : mapState === 'error'
          ? '카카오맵을 불러오지 못했어요.'
          : ''

  return (
    <div className="search-area-recommendation-map">
      <div
        aria-label="추천 수색 영역 지도"
        className="search-area-recommendation-map__viewport"
        role="region"
      >
        <div className="search-area-recommendation-map__canvas" ref={containerRef} />
        {mapState !== 'ready' && (
          <span aria-hidden="true" className="search-area-recommendation-map__grid" />
        )}
      </div>
      {statusText && <p role="status">{statusText}</p>}
    </div>
  )
}

export type { SearchAreaRecommendationMapProps }
