import { useEffect, useRef, useState } from 'react'
import { KAKAO_MAP_CONFIG } from '@/config/kakao'

declare global {
  interface Window {
    kakao: {
      maps: {
        Map: new (container: HTMLElement, options: any) => any
        LatLng: new (lat: number, lng: number) => any
        LatLngBounds: new (sw?: any, ne?: any) => any
        Marker: new (options: any) => any
        CustomOverlay: new (options: any) => any
        InfoWindow: new (options: any) => any
        load: (callback: () => void) => void
        event: {
            addListener: (target: any, type: string, handler: () => void) => void
        }
      }
    }
  }
}

interface MapOptions {
  center: {
    latitude: number
    longitude: number
  }
  level?: number
}

interface KakaoMap {
  relayout: () => void
  getMarkers: () => any[]
  setCenter: (position: any) => void
  setLevel: (level: number) => void
  getBounds: () => any
}

const DEFAULT_CENTER = {
  latitude: 33.360701,
  longitude: 126.570667,
};

export function useKakaoMap(options?: MapOptions) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<KakaoMap | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string>('')

  // 카카오맵 SDK 로드
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('카카오맵 스크립트 로딩 시작');
    }
    
    const kakaoMapScript = document.getElementById(KAKAO_MAP_CONFIG.scriptId)
    if (kakaoMapScript) {
      if (process.env.NODE_ENV === 'development') {
        console.log('스크립트가 이미 존재함, 카카오 객체 확인:', !!window.kakao);
      }
      if (window.kakao && window.kakao.maps) {
        if (process.env.NODE_ENV === 'development') {
          console.log('카카오맵이 이미 로드됨');
        }
        setIsLoaded(true);
      }
      return
    }

    const script = document.createElement('script')
    script.id = KAKAO_MAP_CONFIG.scriptId
    script.async = true
    script.src = `${KAKAO_MAP_CONFIG.scriptUrl}?appkey=${KAKAO_MAP_CONFIG.appKey}&autoload=false`
    
    script.onerror = (event) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('스크립트 로드 실패:', event);
      }
      setError('카카오맵 SDK를 불러오는데 실패했습니다.')
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }

    script.onload = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('스크립트 로드 완료, 카카오맵 초기화 중...');
      }
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          if (process.env.NODE_ENV === 'development') {
            console.log('카카오맵 로드 완료');
          }
          setIsLoaded(true)
        })
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error('window.kakao.maps가 존재하지 않음');
        }
        setError('카카오맵 객체를 찾을 수 없습니다.');
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('스크립트 태그 DOM에 추가');
    }
    document.head.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  // 지도 초기화
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('지도 초기화 useEffect:', { 
        mapRefCurrent: !!mapRef.current, 
        windowKakao: !!window.kakao?.maps, 
        isLoaded 
      });
    }
    
    if (!mapRef.current || !window.kakao?.maps || !isLoaded) return

    try {
      // 이전 지도 인스턴스 정리
      if (map) {
        mapRef.current.innerHTML = ''
      }

      // 지도 옵션 설정
      const currentOptions = options || { center: DEFAULT_CENTER };
      if (process.env.NODE_ENV === 'development') {
        console.log('지도 옵션:', currentOptions);
      }
      
      const mapOptions = {
        center: new window.kakao.maps.LatLng(currentOptions.center.latitude, currentOptions.center.longitude),
        level: currentOptions.level || KAKAO_MAP_CONFIG.defaultLevel,
        draggable: true,
        scrollwheel: true,
        minLevel: 1,
        maxLevel: 13,
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('지도 생성 중...');
      }
      // 지도 생성
      const mapInstance = new window.kakao.maps.Map(mapRef.current, mapOptions)
      if (process.env.NODE_ENV === 'development') {
        console.log('지도 생성 완료:', mapInstance);
      }
      
      // 지도 크기 재설정
      setTimeout(() => {
        mapInstance.relayout()
        if (process.env.NODE_ENV === 'development') {
          console.log('지도 크기 재설정 완료');
        }
      }, 100)

      setMap(mapInstance as KakaoMap)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error initializing map:', error)
      }
      setError('지도를 불러오는 중 오류가 발생했습니다.')
    }
  }, [isLoaded, options?.center.latitude, options?.center.longitude, options?.level])

  // 지도 크기 변경 감지
  useEffect(() => {
    if (map) {
      const handleResize = () => {
        map.relayout()
      }

      window.addEventListener('resize', handleResize)
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [map])

  return {
    mapRef,
    map,
    isLoaded,
    error,
  }
} 