/**
 * 두 지점 간의 거리를 계산합니다. (Haversine formula)
 * @param lat1 첫 번째 지점의 위도
 * @param lon1 첫 번째 지점의 경도
 * @param lat2 두 번째 지점의 위도
 * @param lon2 두 번째 지점의 경도
 * @returns 거리 (미터 단위)
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // 지구의 반지름 (미터)
  const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // 미터 단위 거리

  return Math.round(distance);
}

/**
 * 거리를 사용자 친화적인 문자열로 변환합니다.
 * @param distance 거리 (미터 단위)
 * @returns 포맷된 거리 문자열
 */
export function formatDistance(distance: number): string {
  if (distance < 1000) {
    return `${distance}m`;
  } else if (distance < 10000) {
    return `${(distance / 1000).toFixed(1)}km`;
  } else {
    return `${Math.round(distance / 1000)}km`;
  }
}

/**
 * 현재 위치를 가져옵니다.
 * @returns Promise<{latitude: number, longitude: number}>
 */
export function getCurrentPosition(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5분
      }
    );
  });
}

/**
 * 위치 권한 상태를 확인합니다.
 * @returns Promise<PermissionState>
 */
export async function checkLocationPermission(): Promise<PermissionState> {
  if (!navigator.permissions) {
    return 'prompt';
  }

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    return permission.state;
  } catch (error) {
    console.warn('위치 권한 확인 중 오류:', error);
    return 'prompt';
  }
} 