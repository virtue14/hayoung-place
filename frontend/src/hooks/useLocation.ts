'use client';

import { useState, useEffect } from 'react';
import { getCurrentPosition, checkLocationPermission } from '@/lib/utils/location';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  permission: PermissionState | null;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
    permission: null,
  });

  const requestLocation = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const permission = await checkLocationPermission();
      setState(prev => ({ ...prev, permission }));

      if (permission === 'denied') {
        throw new Error('위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.');
      }

      const position = await getCurrentPosition();
      setState(prev => ({
        ...prev,
        latitude: position.latitude,
        longitude: position.longitude,
        loading: false,
        error: null,
      }));
    } catch (error) {
      let errorMessage = '위치를 가져올 수 없습니다.';
      
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '위치 권한이 거부되었습니다.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '위치 정보를 사용할 수 없습니다.';
            break;
          case error.TIMEOUT:
            errorMessage = '위치 요청 시간이 초과되었습니다.';
            break;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // 컴포넌트 마운트 시 자동으로 위치 요청
  useEffect(() => {
    requestLocation();
  }, []);

  return {
    ...state,
    requestLocation,
    clearError,
    hasLocation: state.latitude !== null && state.longitude !== null,
  };
} 