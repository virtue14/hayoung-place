// 카카오 장소 검색 API 응답 타입
export interface KakaoPlaceSearchResult {
  id: string;
  place_name: string;
  road_address_name: string;
  address_name: string;
  phone: string;
  place_url: string;
  category_group_code: string;
  category_group_name: string;
  category_name: string;
  x: string;  // longitude
  y: string;  // latitude
}

// 커스텀 카테고리 타입
export type CustomCategory = '맛집' | '카페' | '해변' | '자연명소' | '문화예술' | '쇼핑' | '체험/액티비티';

// 갤러리 이미지 타입
export interface GalleryImage {
  url: string;
  isMain: boolean;
}

export interface Location {
    type: 'Point';
    coordinates: [number, number]; // [경도, 위도]
}

export enum PlaceCategory {
    RESTAURANT = 'RESTAURANT',
    CAFE = 'CAFE',
    GALLERY = 'GALLERY',
    PHOTO_SPOT = 'PHOTO_SPOT',
    CULTURE_ACTIVITY = 'CULTURE_ACTIVITY',
    SHOPPING = 'SHOPPING',
    OTHER = 'OTHER',
}

// 장소 데이터 타입
export interface Place {
  id: string;
  name: string;
  address: string;
  location: Location;
  placeUrl: string;
  category: PlaceCategory;
  description: string;
  photos: string[];
  viewCount: number;
  createdBy: string;
  createdAt: string; // ISO 8601 형식의 날짜 문자열
  updatedAt: string;
}

// 사용자 저장 장소 타입
export interface UserPlace {
  userId: string;
  placeId: string;
  savedAt: Date;
}

export interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
} 