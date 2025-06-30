import { useEffect, useRef, useState } from 'react'
import { KAKAO_MAP_CONFIG } from '@/config/kakao'

// 전역 스크립트 로딩 상태 관리
let isScriptLoading = false
let isScriptLoaded = false
let scriptLoadPromise: Promise<void> | null = null

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
    const loadKakaoScript = async () => {
      // 이미 로드된 경우
      if (isScriptLoaded && window.kakao?.maps) {
        if (process.env.NODE_ENV === 'development') {
          console.log('카카오맵이 이미 로드됨');
        }
        setIsLoaded(true);
        return;
      }

      // 로딩 중인 경우 기존 Promise 대기
      if (isScriptLoading && scriptLoadPromise) {
        try {
          await scriptLoadPromise;
          setIsLoaded(true);
        } catch (error) {
          setError('카카오맵 SDK를 불러오는데 실패했습니다.');
        }
        return;
      }

      // 새로운 스크립트 로딩 시작
      if (process.env.NODE_ENV === 'development') {
        console.log('카카오맵 스크립트 로딩 시작');
      }
      
      isScriptLoading = true;
      
      scriptLoadPromise = new Promise((resolve, reject) => {
        const existingScript = document.getElementById(KAKAO_MAP_CONFIG.scriptId);
        if (existingScript) {
          existingScript.remove();
        }

        const script = document.createElement('script');
        script.id = KAKAO_MAP_CONFIG.scriptId;
        script.async = true;
        script.src = `${KAKAO_MAP_CONFIG.scriptUrl}?appkey=${KAKAO_MAP_CONFIG.appKey}&autoload=false`;
        
        script.onerror = () => {
          isScriptLoading = false;
          isScriptLoaded = false;
          scriptLoadPromise = null;
          reject(new Error('Script load failed'));
        };

        script.onload = () => {
          if (window.kakao?.maps) {
            window.kakao.maps.load(() => {
              isScriptLoading = false;
              isScriptLoaded = true;
              if (process.env.NODE_ENV === 'development') {
                console.log('카카오맵 로드 완료');
              }
              resolve();
            });
          } else {
            isScriptLoading = false;
            isScriptLoaded = false;
            scriptLoadPromise = null;
            reject(new Error('Kakao maps object not found'));
          }
        };

        document.head.appendChild(script);
      });

      try {
        await scriptLoadPromise;
        setIsLoaded(true);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('카카오맵 로딩 실패:', error);
        }
        setError('카카오맵 SDK를 불러오는데 실패했습니다.');
      }
    };

    loadKakaoScript();
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
        disableDoubleClick: false,
        disableDoubleClickZoom: false,
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
      
      // 모바일에서 지도 크기 재설정을 여러 번 시도
      const relayoutMap = () => {
        if (mapInstance && mapRef.current) {
          mapInstance.relayout()
          if (process.env.NODE_ENV === 'development') {
            console.log('지도 크기 재설정 완료');
          }
        }
      }

      // 즉시 실행
      relayoutMap()
      
      // 100ms 후 재실행 (모바일 렌더링 지연 대응)
      setTimeout(relayoutMap, 100)
      
      // 500ms 후 재실행 (추가 안전장치)
      setTimeout(relayoutMap, 500)

      setMap(mapInstance as KakaoMap)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error initializing map:', error)
      }
      setError('지도를 불러오는 중 오류가 발생했습니다.')
    }
  }, [isLoaded, options?.center.latitude, options?.center.longitude, options?.level])

  // 지도 크기 변경 감지 및 모바일 최적화
  useEffect(() => {
    if (map) {
      const handleResize = () => {
        // 모바일에서는 약간의 지연을 두고 relayout 실행
        setTimeout(() => {
          if (map) {
            map.relayout()
          }
        }, 100)
      }

      const handleOrientationChange = () => {
        // 모바일 회전 시 추가 지연
        setTimeout(() => {
          if (map) {
            map.relayout()
          }
        }, 300)
      }

      window.addEventListener('resize', handleResize)
      window.addEventListener('orientationchange', handleOrientationChange)
      
      // 모바일에서 스크롤 완료 후 지도 재조정
      let scrollTimeout: NodeJS.Timeout
      const handleScroll = () => {
        clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(() => {
          if (map) {
            map.relayout()
          }
        }, 200)
      }

      if (typeof window !== 'undefined' && window.innerWidth <= 768) {
        window.addEventListener('scroll', handleScroll, { passive: true })
      }

      return () => {
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('orientationchange', handleOrientationChange)
        window.removeEventListener('scroll', handleScroll)
        clearTimeout(scrollTimeout)
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