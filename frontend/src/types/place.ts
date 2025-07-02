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

export enum SubCategory {
    // 맛집 (RESTAURANT) 서브카테고리
    KOREAN_FOOD = 'KOREAN_FOOD',
    CHINESE_FOOD = 'CHINESE_FOOD',
    JAPANESE_FOOD = 'JAPANESE_FOOD',
    WESTERN_FOOD = 'WESTERN_FOOD',
    FAST_FOOD = 'FAST_FOOD',
    SEAFOOD = 'SEAFOOD',
    BBQ = 'BBQ',
    DESSERT = 'DESSERT',
    
    // 카페 (CAFE) 서브카테고리
    COFFEE_SHOP = 'COFFEE_SHOP',
    BAKERY = 'BAKERY',
    TEA_HOUSE = 'TEA_HOUSE',
    ROASTERY = 'ROASTERY',
    
    // 갤러리 (GALLERY) 서브카테고리
    ART_GALLERY = 'ART_GALLERY',
    MUSEUM = 'MUSEUM',
    EXHIBITION_HALL = 'EXHIBITION_HALL',
    
    // 포토스팟 (PHOTO_SPOT) 서브카테고리
    SCENIC_VIEW = 'SCENIC_VIEW',
    LANDMARK = 'LANDMARK',
    BEACH = 'BEACH',
    MOUNTAIN = 'MOUNTAIN',
    GARDEN = 'GARDEN',
    
    // 문화활동 (CULTURE_ACTIVITY) 서브카테고리
    THEATER = 'THEATER',
    CINEMA = 'CINEMA',
    CONCERT_HALL = 'CONCERT_HALL',
    CULTURAL_CENTER = 'CULTURAL_CENTER',
    
    // 쇼핑 (SHOPPING) 서브카테고리
    DEPARTMENT_STORE = 'DEPARTMENT_STORE',
    OUTLET = 'OUTLET',
    TRADITIONAL_MARKET = 'TRADITIONAL_MARKET',
    SHOPPING_MALL = 'SHOPPING_MALL',
    
    // 기타 (OTHER) 서브카테고리
    ACCOMMODATION = 'ACCOMMODATION',
    ENTERTAINMENT = 'ENTERTAINMENT',
    SPORTS = 'SPORTS',
    NONE = 'NONE' // 서브카테고리 없음
}

// 장소 데이터 타입
export interface Place {
  id: string;
  name: string;
  address: string;
  location: Location;
  placeUrl: string;
  category: PlaceCategory;
  subCategory: SubCategory;
  description: string;
  photos: string[];
  viewCount: number;
  commentCount: number;
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

// 카테고리별 서브카테고리 매핑
export const CATEGORY_SUBCATEGORY_MAPPING: Record<PlaceCategory, SubCategory[]> = {
    [PlaceCategory.RESTAURANT]: [
        SubCategory.KOREAN_FOOD,
        SubCategory.CHINESE_FOOD,
        SubCategory.JAPANESE_FOOD,
        SubCategory.WESTERN_FOOD,
        SubCategory.FAST_FOOD,
        SubCategory.SEAFOOD,
        SubCategory.BBQ,
        SubCategory.DESSERT
    ],
    [PlaceCategory.CAFE]: [
        SubCategory.COFFEE_SHOP,
        SubCategory.BAKERY,
        SubCategory.TEA_HOUSE,
        SubCategory.ROASTERY
    ],
    [PlaceCategory.GALLERY]: [
        SubCategory.ART_GALLERY,
        SubCategory.MUSEUM,
        SubCategory.EXHIBITION_HALL
    ],
    [PlaceCategory.PHOTO_SPOT]: [
        SubCategory.SCENIC_VIEW,
        SubCategory.LANDMARK,
        SubCategory.BEACH,
        SubCategory.MOUNTAIN,
        SubCategory.GARDEN
    ],
    [PlaceCategory.CULTURE_ACTIVITY]: [
        SubCategory.THEATER,
        SubCategory.CINEMA,
        SubCategory.CONCERT_HALL,
        SubCategory.CULTURAL_CENTER
    ],
    [PlaceCategory.SHOPPING]: [
        SubCategory.DEPARTMENT_STORE,
        SubCategory.OUTLET,
        SubCategory.TRADITIONAL_MARKET,
        SubCategory.SHOPPING_MALL
    ],
    [PlaceCategory.OTHER]: [
        SubCategory.ACCOMMODATION,
        SubCategory.ENTERTAINMENT,
        SubCategory.SPORTS,
        SubCategory.NONE
    ]
};

// 카테고리/서브카테고리 한국어 이름 매핑
export const CATEGORY_LABELS: Record<PlaceCategory, string> = {
    [PlaceCategory.RESTAURANT]: '맛집',
    [PlaceCategory.CAFE]: '카페',
    [PlaceCategory.GALLERY]: '미술관/전시',
    [PlaceCategory.PHOTO_SPOT]: '포토스팟',
    [PlaceCategory.CULTURE_ACTIVITY]: '문화 · 체험',
    [PlaceCategory.SHOPPING]: '쇼핑',
    [PlaceCategory.OTHER]: '기타'
};

export const SUBCATEGORY_LABELS: Record<SubCategory, string> = {
    [SubCategory.KOREAN_FOOD]: '한식',
    [SubCategory.CHINESE_FOOD]: '중식',
    [SubCategory.JAPANESE_FOOD]: '일식',
    [SubCategory.WESTERN_FOOD]: '양식',
    [SubCategory.FAST_FOOD]: '패스트푸드',
    [SubCategory.SEAFOOD]: '해산물',
    [SubCategory.BBQ]: '바베큐',
    [SubCategory.DESSERT]: '디저트',
    [SubCategory.COFFEE_SHOP]: '커피숍',
    [SubCategory.BAKERY]: '베이커리',
    [SubCategory.TEA_HOUSE]: '티하우스',
    [SubCategory.ROASTERY]: '로스터리',
    [SubCategory.ART_GALLERY]: '미술관',
    [SubCategory.MUSEUM]: '박물관',
    [SubCategory.EXHIBITION_HALL]: '전시관',
    [SubCategory.SCENIC_VIEW]: '경치명소',
    [SubCategory.LANDMARK]: '랜드마크',
    [SubCategory.BEACH]: '해변',
    [SubCategory.MOUNTAIN]: '산',
    [SubCategory.GARDEN]: '정원',
    [SubCategory.THEATER]: '극장',
    [SubCategory.CINEMA]: '영화관',
    [SubCategory.CONCERT_HALL]: '콘서트홀',
    [SubCategory.CULTURAL_CENTER]: '문화센터',
    [SubCategory.DEPARTMENT_STORE]: '백화점',
    [SubCategory.OUTLET]: '아울렛',
    [SubCategory.TRADITIONAL_MARKET]: '전통시장',
    [SubCategory.SHOPPING_MALL]: '쇼핑몰',
    [SubCategory.ACCOMMODATION]: '숙박',
    [SubCategory.ENTERTAINMENT]: '엔터테인먼트',
    [SubCategory.SPORTS]: '스포츠',
    [SubCategory.NONE]: '선택안함'
}; 