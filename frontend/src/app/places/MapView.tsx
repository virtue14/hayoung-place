'use client'

import { useEffect, useState } from 'react'
import { Place } from '@/types/place'
import { useKakaoMap } from '@/hooks/useKakaoMap'

const INITIAL_CENTER_COORDS = { latitude: 33.3616666, longitude: 126.5291666 };

interface MapViewProps {
  places: Place[];
}

export default function MapView({ places }: MapViewProps) {
    const { mapRef, map, isLoaded, error } = useKakaoMap({
        center: INITIAL_CENTER_COORDS,
        level: 9,
    });
    
    const [markers, setMarkers] = useState<any[]>([]);

    // 디버깅을 위한 로그
    useEffect(() => {
        console.log('MapView 상태:', { isLoaded, map: !!map, error, placesCount: places.length });
    }, [isLoaded, map, error, places.length]);

    // 2. 지도 로드 후 초기 설정 및 마커 생성
    useEffect(() => {
        console.log('마커 생성 useEffect 시작:', { map: !!map, isLoaded, placesCount: places.length });
        
        if (!map || !isLoaded) {
            console.log('지도가 준비되지 않음:', { map: !!map, isLoaded });
            return;
        }

        console.log('기존 마커 제거 중...', markers.length);
        // 기존 마커 제거
        markers.forEach(marker => marker.setMap(null));
        
        // 제주도 경계 설정
        const JEJU_BOUNDS = new window.kakao.maps.LatLngBounds(
            new window.kakao.maps.LatLng(33.1, 126.1),
            new window.kakao.maps.LatLng(33.6, 127.0)
        );
        const INITIAL_CENTER = new window.kakao.maps.LatLng(INITIAL_CENTER_COORDS.latitude, INITIAL_CENTER_COORDS.longitude);

        const restrictBounds = () => {
            const currentBounds = map.getBounds();
            if (!JEJU_BOUNDS.contain(currentBounds.getNorthEast()) || !JEJU_BOUNDS.contain(currentBounds.getSouthWest())) {
                map.setCenter(INITIAL_CENTER);
            }
        };
        
        window.kakao.maps.event.addListener(map, 'dragend', restrictBounds);

        console.log('장소 마커 생성 중...', places.length, '개');
        // 장소 마커 생성
        const newMarkers = places.map(place => {
            const [longitude, latitude] = place.location.coordinates;
            const position = new window.kakao.maps.LatLng(latitude, longitude);

            return new window.kakao.maps.Marker({
                position: position,
                clickable: true,
                map: map,
            });
        });
        setMarkers(newMarkers);
        console.log('마커 생성 완료:', newMarkers.length, '개');

    }, [map, isLoaded, places]);

    // 3. 렌더링
    if (error) {
        return <div className="w-full h-full flex items-center justify-center text-red-500">
            오류: {error}
        </div>;
    }

    if (!isLoaded) {
        return <div className="w-full h-full flex items-center justify-center">
            지도 로딩 중...
        </div>;
    }

    return <div ref={mapRef} className="w-full h-full" />;
} 