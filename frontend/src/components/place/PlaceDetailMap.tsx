'use client'

import { useEffect, useState } from 'react'
import { useKakaoMap } from '@/hooks/useKakaoMap'
import { useLocation } from '@/hooks/useLocation'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { RedMarkerIcon } from '@/components/MarkerIcon'
import { Place } from '@/types/place'

interface PlaceDetailMapProps {
  place: Place
  className?: string
}

export default function PlaceDetailMap({ place, className = '' }: PlaceDetailMapProps) {
  const [longitude, latitude] = place.location.coordinates
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentMap, setCurrentMap] = useState<any>(null)
  
  const { mapRef, map, isLoaded, error } = useKakaoMap({
    center: {
      latitude,
      longitude,
    },
    level: 3, // 상세 보기를 위해 더 확대된 레벨
  })

  // 현재 위치 정보
  const { latitude: myLatitude, longitude: myLongitude, hasLocation } = useLocation()

  // 내 위치로 이동 함수
  const goToMyLocation = () => {
    if (currentMap && hasLocation && myLatitude && myLongitude) {
      const myPosition = new window.kakao.maps.LatLng(myLatitude, myLongitude)
      currentMap.setCenter(myPosition)
      currentMap.setLevel(3) // 가까이 확대
    }
  }

  // 장소로 이동 함수
  const goToPlace = () => {
    if (currentMap) {
      const placePosition = new window.kakao.maps.LatLng(latitude, longitude)
      currentMap.setCenter(placePosition)
      currentMap.setLevel(3)
    }
  }

  useEffect(() => {
    if (isLoaded && map) {
      setCurrentMap(map)
      
      // 기존 마커 제거
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.getMarkers?.()?.forEach((marker: any) => marker.setMap(null))

      // 장소 마커 추가 (기본 마커)
      const position = new window.kakao.maps.LatLng(latitude, longitude)
      
      const placeMarker = new window.kakao.maps.Marker({
        position: position,
        map: map
      })

      // 내 위치 마커 추가 (있을 경우) - 빨간색 핀 마커
      if (hasLocation && myLatitude && myLongitude) {
        const myPosition = new window.kakao.maps.LatLng(myLatitude, myLongitude)
        
        const myLocationContent = document.createElement('div')
        myLocationContent.className = 'my-location-marker'
        myLocationContent.innerHTML = RedMarkerIcon

        const myLocationOverlay = new window.kakao.maps.CustomOverlay({
          position: myPosition,
          content: myLocationContent,
          yAnchor: 1,
          xAnchor: 0.5
        })

        myLocationOverlay.setMap(map)

        // 내 위치 인포윈도우
        const myLocationInfoWindow = new window.kakao.maps.InfoWindow({
          content: `
            <div style="padding: 8px 12px; font-size: 12px; color: #EF4444; font-weight: 600;">
              📍 내 위치
            </div>
          `,
          removable: false
        })

        // 내 위치 마커 클릭 이벤트
        myLocationContent.addEventListener('click', function() {
          myLocationInfoWindow.open(map, myPosition)
          setTimeout(() => {
            myLocationInfoWindow.close()
          }, 2000)
        })
      }

      // 장소 마커 클릭 이벤트 - 인포윈도우 표시
      window.kakao.maps.event.addListener(placeMarker, 'click', function() {
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
        infoWindow.open(map, placeMarker)
      })

      // 지도 중심을 마커 위치로 설정
      map.setCenter(position)
    }
  }, [isLoaded, map, place, latitude, longitude, hasLocation, myLatitude, myLongitude])

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
    <div className="relative w-full h-full">
      <div 
        ref={mapRef} 
        className={`w-full h-full ${className}`}
      />
      
      {/* 지도 조작 버튼들 */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
        {/* 내 위치로 가기 버튼 */}
        {hasLocation && (
          <button
            onClick={goToMyLocation}
            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg shadow-lg transition-all duration-200"
            title="내 위치로 이동"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )}
        
        {/* 장소로 가기 버튼 */}
        <button
          onClick={goToPlace}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-lg transition-all duration-200"
          title="장소로 이동"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* 내 위치 표시 안내 */}
      {hasLocation && (
        <div className="absolute bottom-3 left-3 bg-red-50 border border-red-200 rounded-lg p-2 shadow-sm z-10">
          <p className="text-xs text-red-700 font-medium">📍 빨간색이 내 위치</p>
        </div>
      )}
    </div>
  )
} 