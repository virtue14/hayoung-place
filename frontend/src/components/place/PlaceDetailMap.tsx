'use client'

import { useEffect } from 'react'
import { useKakaoMap } from '@/hooks/useKakaoMap'
import { MarkerIcon } from '@/components/MarkerIcon'
import { Place } from '@/types/place'

interface PlaceDetailMapProps {
  place: Place
  className?: string
}

export default function PlaceDetailMap({ place, className = '' }: PlaceDetailMapProps) {
  const [longitude, latitude] = place.location.coordinates
  
  const { mapRef, map, isLoaded, error } = useKakaoMap({
    center: {
      latitude,
      longitude,
    },
    level: 3, // 상세 보기를 위해 더 확대된 레벨
  })

  useEffect(() => {
    if (isLoaded && map) {
      // 기존 마커 제거
      map.getMarkers?.()?.forEach((marker: any) => marker.setMap(null))

      // 장소 마커 추가
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

      // 마커 클릭 이벤트 - 인포윈도우 표시
      content.addEventListener('click', () => {
        const infoWindow = new window.kakao.maps.InfoWindow({
          content: `
            <div class="p-3 min-w-[200px] max-w-[300px]">
              <div class="font-medium text-gray-900 mb-1">${place.name}</div>
              <div class="text-sm text-gray-600 mb-2">${place.address}</div>
              ${place.description ? `
                <div class="text-xs text-gray-500 line-clamp-2 mb-2">
                  ${place.description}
                </div>
              ` : ''}
              <div class="flex gap-2">
                ${place.placeUrl ? `
                  <a 
                    href="${place.placeUrl}" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="text-xs text-blue-600 hover:text-blue-700 underline"
                  >
                    카카오맵에서 보기
                  </a>
                ` : ''}
              </div>
            </div>
          `,
          removable: true,
        })
        infoWindow.open(map, position)
      })

      // 지도 중심을 마커 위치로 설정
      map.setCenter(position)
    }
  }, [isLoaded, map, place, latitude, longitude])

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center text-gray-500">
          <p className="text-sm">지도를 불러올 수 없습니다</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-sm">지도를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={mapRef} 
      className={`kakao-map-container ${className}`}
    />
  )
} 