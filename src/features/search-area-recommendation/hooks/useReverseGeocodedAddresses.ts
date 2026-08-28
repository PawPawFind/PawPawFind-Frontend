import { useEffect, useState } from 'react'
import { loadKakaoMaps } from '@/features/report-location/kakao/loadKakaoMaps'
import type { SearchAreaItem } from '../types'

type AddressByRank = Record<number, string | null>

// AI 응답에는 좌표(latitude/longitude)만 오고 주소 문자열은 없어서,
// report-location 피처에서 쓰는 것과 같은 카카오 역지오코딩(coord2Address)으로
// "1순위" 옆에 사람이 읽을 수 있는 주소를 붙여준다.
// areas는 mutation이 성공할 때마다 새로 만들어지는 배열이라, 다시 추천받을 때만
// 참조가 바뀌어 재실행된다.
export function useReverseGeocodedAddresses(areas: SearchAreaItem[]) {
  const [addressesByRank, setAddressesByRank] = useState<AddressByRank>({})
  const appKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY ?? ''

  useEffect(() => {
    if (areas.length === 0) {
      setAddressesByRank({})
      return
    }

    if (!appKey) {
      setAddressesByRank(
        Object.fromEntries(areas.map((area) => [area.rank, null])) as AddressByRank,
      )
      return
    }
    let active = true

    void loadKakaoMaps(appKey)
      .then((maps) => {
        if (!active || !maps.services) return
        const geocoder = new maps.services.Geocoder()

        areas.forEach((area) => {
          geocoder.coord2Address(area.center.longitude, area.center.latitude, (result, status) => {
            if (!active) return
            const addressResult = result[0]
            const address =
              addressResult?.road_address?.address_name ?? addressResult?.address?.address_name

            setAddressesByRank((previous) => ({
              ...previous,
              [area.rank]: status === maps.services.Status.OK && address ? address : null,
            }))
          })
        })
      })
      .catch(() => {
        if (active) {
          setAddressesByRank(
            Object.fromEntries(areas.map((area) => [area.rank, null])) as AddressByRank,
          )
        }
      })

    return () => {
      active = false
    }
  }, [appKey, areas])

  return { addressesByRank }
}
