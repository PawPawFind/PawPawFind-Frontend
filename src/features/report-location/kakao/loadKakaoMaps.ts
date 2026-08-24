import type { KakaoMapsApi } from './kakaoMaps.types'

const KAKAO_MAPS_SCRIPT_ID = 'kakao-maps-sdk'
let loadingPromise: Promise<KakaoMapsApi> | undefined

function getLoadedMaps() {
  return window.kakao?.maps.services ? window.kakao.maps : undefined
}

export function loadKakaoMaps(appKey: string): Promise<KakaoMapsApi> {
  const loadedMaps = getLoadedMaps()
  if (loadedMaps) return Promise.resolve(loadedMaps)

  if (loadingPromise) return loadingPromise

  loadingPromise = new Promise<KakaoMapsApi>((resolve, reject) => {
    const handleSdkLoad = () => {
      const maps = window.kakao?.maps

      if (!maps) {
        reject(new Error('카카오맵 SDK 전역 객체를 찾을 수 없습니다.'))
        return
      }

      maps.load(() => {
        const readyMaps = getLoadedMaps()
        if (readyMaps) resolve(readyMaps)
        else reject(new Error('카카오맵 services 라이브러리를 불러오지 못했습니다.'))
      })
    }

    const existingScript = document.getElementById(KAKAO_MAPS_SCRIPT_ID)
    if (existingScript instanceof HTMLScriptElement) {
      existingScript.addEventListener('load', handleSdkLoad, { once: true })
      existingScript.addEventListener(
        'error',
        () => reject(new Error('카카오맵 SDK 요청에 실패했습니다.')),
        { once: true },
      )
      return
    }

    const script = document.createElement('script')
    script.id = KAKAO_MAPS_SCRIPT_ID
    script.async = true
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false&libraries=services`
    script.addEventListener('load', handleSdkLoad, { once: true })
    script.addEventListener('error', () => reject(new Error('카카오맵 SDK 요청에 실패했습니다.')), {
      once: true,
    })
    document.head.append(script)
  }).catch((error: unknown) => {
    loadingPromise = undefined
    throw error
  })

  return loadingPromise
}
