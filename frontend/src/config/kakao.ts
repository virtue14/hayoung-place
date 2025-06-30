export const KAKAO_MAP_CONFIG = {
  appKey: process.env.NEXT_PUBLIC_KAKAOMAP_API_KEY,
  scriptUrl: `https://dapi.kakao.com/v2/maps/sdk.js`,
  scriptId: 'kakao-map-script',
  defaultCenter: {
    latitude: 33.3616666,
    longitude: 126.5291666
  },
  defaultLevel: 9,
} as const

// 환경 변수 검증
if (!KAKAO_MAP_CONFIG.appKey) {
  throw new Error(
    'NEXT_PUBLIC_KAKAOMAP_API_KEY is not defined. ' +
    'Please add it to your .env.local file.'
  )
} 