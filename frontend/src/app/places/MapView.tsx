'use client'

import { useEffect, useRef, useState } from 'react'
import { Place, CATEGORY_LABELS, SUBCATEGORY_LABELS, SubCategory } from '@/types/place'
import { useKakaoMap } from '@/hooks/useKakaoMap'
import { useLocation } from '@/hooks/useLocation'

interface MapViewProps {
  places: Place[];
}

export default function MapView({ places }: MapViewProps) {
    const mapRef = useRef<HTMLDivElement>(null)
    const { isLoaded } = useKakaoMap()
    const { latitude, longitude, hasLocation, error } = useLocation()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [currentMap, setCurrentMap] = useState<any>(null)

    // 내 위치로 이동 함수
    const goToMyLocation = () => {
        if (currentMap && hasLocation && latitude && longitude) {
            const myPosition = new window.kakao.maps.LatLng(latitude, longitude)
            // 강제로 중심 설정하고 레벨 변경
            currentMap.setCenter(myPosition)
            currentMap.setLevel(3, { animate: true })
            // 추가로 panTo로 부드럽게 이동
            setTimeout(() => {
                currentMap.panTo(myPosition)
            }, 50)
        }
    }

    useEffect(() => {
        if (!isLoaded || !mapRef.current) return

        // 기본 지도 중심 (서울)
        const defaultCenter = new window.kakao.maps.LatLng(37.5665, 126.9780)
        
        // 현재 위치가 있으면 해당 위치를, 없으면 기본 위치를 중심으로 설정
        const center = hasLocation 
          ? new window.kakao.maps.LatLng(latitude!, longitude!)
          : defaultCenter

        const mapOption = {
          center: center,
          level: hasLocation ? 6 : 8 // 현재 위치가 있으면 더 가깝게
        }

        const map = new window.kakao.maps.Map(mapRef.current, mapOption)
        setCurrentMap(map)

        // 내 위치 마커 표시 (빨간색 핀 마커)
        if (hasLocation) {
          const myPosition = new window.kakao.maps.LatLng(latitude!, longitude!)
          
          // 빨간색 핀 마커 생성
          const myLocationContent = document.createElement('div')
          myLocationContent.className = 'my-location-marker'
          myLocationContent.innerHTML = `
            <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <filter id="my-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
              </filter>
              <path d="M20 0C8.96 0 0 8.96 0 20C0 31.04 20 48 20 48C20 48 40 31.04 40 20C40 8.96 31.04 0 20 0ZM20 28C15.58 28 12 24.42 12 20C12 15.58 15.58 12 20 12C24.42 12 28 15.58 28 20C28 24.42 24.42 28 20 28Z" 
                    fill="#FF385C" 
                    filter="url(#my-shadow)"/>
            </svg>
          `

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
              <div style="padding: 8px 12px; font-size: 12px; color: #FF385C; font-weight: 600;">
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

        // 장소 마커들 표시
        places.forEach((place) => {
          const [longitude, latitude] = place.location.coordinates
          const markerPosition = new window.kakao.maps.LatLng(latitude, longitude)
          
          const marker = new window.kakao.maps.Marker({
            position: markerPosition,
            map: map
          })

          // 인포윈도우 생성 (이전 버전의 자세한 정보)
          const categoryText = CATEGORY_LABELS[place.category];
          const subcategoryText = place.subCategory && place.subCategory !== SubCategory.NONE 
              ? ` - ${SUBCATEGORY_LABELS[place.subCategory]}`
              : '';
          
          const infoWindow = new window.kakao.maps.InfoWindow({
            content: `
                <div style="padding: 15px; min-width: 250px; max-width: 300px; position: relative;">
                    <button onclick="window.closeInfoWindow()" style="
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        background: #f3f4f6;
                        border: none;
                        border-radius: 50%;
                        width: 24px;
                        height: 24px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        font-size: 14px;
                        color: #6b7280;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'">
                        ✕
                    </button>
                    <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #1f2937; padding-right: 30px;">
                        ${place.name}
                    </div>
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
                        ${categoryText}${subcategoryText}
                    </div>
                    <div style="font-size: 13px; color: #374151; margin-bottom: 8px; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        📍 ${place.address}
                    </div>
                    ${place.description ? `
                        <div style="font-size: 13px; color: #4b5563; margin-bottom: 10px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">
                            ${place.description}
                        </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                        <span style="font-size: 12px; color: #3b82f6;">
                            👁️ ${place.viewCount || 0} 조회
                        </span>
                        <a href="/places/${place.id}" style="
                            background: #3b82f6; 
                            color: white; 
                            padding: 4px 12px; 
                            border-radius: 6px; 
                            text-decoration: none; 
                            font-size: 12px;
                            font-weight: 500;
                            transition: background 0.2s;
                        " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">상세보기</a>
                    </div>
                </div>
            `,
            removable: true
          })

          // 마커 클릭 이벤트
          window.kakao.maps.event.addListener(marker, 'click', function() {
            // 기존에 열린 인포윈도우가 있다면 닫기
            if (window.closeInfoWindow) {
              window.closeInfoWindow()
            }
            
            // 새 인포윈도우 열기
            infoWindow.open(map, marker)
            
            // 전역 함수에 현재 인포윈도우 저장
            window.closeInfoWindow = () => {
              infoWindow.close()
            }
          })
        })

        // 모든 마커를 포함하는 범위 설정 (현재 위치와 장소들 포함)
        if (places.length > 0) {
          const bounds = new window.kakao.maps.LatLngBounds()
          
          // 현재 위치 추가
          if (hasLocation) {
            bounds.extend(new window.kakao.maps.LatLng(latitude!, longitude!))
          }
          
          // 모든 장소 위치 추가
          places.forEach(place => {
            const [longitude, latitude] = place.location.coordinates
            bounds.extend(new window.kakao.maps.LatLng(latitude, longitude))
          })
          
          map.setBounds(bounds)
        }

    }, [isLoaded, places, hasLocation, latitude, longitude])



    if (!isLoaded) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">지도를 불러오는 중...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="relative w-full h-full">
            <div ref={mapRef} className="w-full h-full rounded-lg" />
            
            {/* 위치 권한 오류 표시 */}
            {error && (
                <div className="absolute top-4 left-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-sm">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-800">
                                📍 {error}
                            </p>
                        </div>
                    </div>
                </div>
            )}
            
            {/* 내 위치로 가기 버튼 */}
            {hasLocation && (
                <button
                    onClick={goToMyLocation}
                    className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium transition-all duration-200 z-10"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    내 위치로
                </button>
            )}

            {/* 현재 위치 표시 안내 */}
            {hasLocation && (
                                 <div className="absolute bottom-4 left-4 bg-red-50 border border-red-200 rounded-lg p-2 shadow-sm">
                     <p className="text-xs text-red-700 font-medium">📍 빨간색이 내 위치입니다</p>
                 </div>
            )}
        </div>
    )
} 