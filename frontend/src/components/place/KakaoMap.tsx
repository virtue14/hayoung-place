'use client'

import { useEffect } from 'react'
import { useKakaoMap } from '@/hooks/useKakaoMap'
import { MarkerIcon } from '@/components/MarkerIcon'
import { Place } from '@/types/place'

interface KakaoMapProps {
  places: Place[]
  center: {
    latitude: number
    longitude: number
  }
  level?: number
}

export default function KakaoMap({ places, center, level = 9 }: KakaoMapProps) {
  const { mapRef, map, isLoaded, error } = useKakaoMap({
    center,
    level,
  })

  useEffect(() => {
    if (isLoaded && map) {
      // 기존 마커 제거
      map.getMarkers?.()?.forEach((marker: any) => marker.setMap(null))

      // 새로운 마커 추가
      places.forEach((place) => {
        const [longitude, latitude] = place.location.coordinates
        const position = new window.kakao.maps.LatLng(latitude, longitude)
        
        const content = document.createElement('div')
        content.className = 'custom-marker marker-animation'
        content.innerHTML = MarkerIcon

        const customOverlay = new window.kakao.maps.CustomOverlay({
          position,
          content,
          yAnchor: 1,
        })

        customOverlay.setMap(map)

        // 마커 클릭 이벤트
        content.addEventListener('click', () => {
          const infoWindow = new window.kakao.maps.InfoWindow({
            content: `
              <div class="p-3 min-w-[200px]">
                <div class="font-medium">${place.name}</div>
                <div class="text-sm text-gray-600">${place.address}</div>
                <div class="mt-1">
                  <span class="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    ${place.category}
                  </span>
                </div>
              </div>
            `,
            removable: true,
          })
          infoWindow.open(map, position)
        })
      })
    }
  }, [isLoaded, map, places])

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div 
      ref={mapRef} 
      className="kakao-map-container"
    />
  )
} 