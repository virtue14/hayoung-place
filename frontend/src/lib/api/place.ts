import { api } from './axios'
import { Page, Place, PlaceCategory, SubCategory } from '@/types/place'

/**
 * 등록된 모든 장소 목록을 조회합니다.
 * @param page 페이지 번호 (0부터 시작)
 * @param size 페이지 크기
 * @param category 카테고리 필터 (선택사항)
 */
export const getAllPlaces = async (page: number = 0, size: number = 5, category?: PlaceCategory | null): Promise<Page<Place>> => {
    let url = `/places?page=${page}&size=${size}`
    if (category) {
        url += `&category=${category}`
    }
    const response = await api.get<Page<Place>>(url)
    return response.data
}

/**
 * 특정 장소의 상세 정보를 조회합니다.
 * @param id 장소 ID
 */
export const getPlaceById = async (id: string): Promise<Place> => {
    const response = await api.get<Place>(`/places/${id}`)
    return response.data
}

interface CreatePlaceRequest {
    name: string;
    address: string;
    placeUrl: string;
    longitude: number;
    latitude: number;
    category: PlaceCategory;
    description: string;
    password: string;
}



/**
 * 새로운 장소를 등록합니다.
 * @param placeData 장소 정보 객체
 */
export const createPlace = async (placeData: CreatePlaceRequest): Promise<Place> => {
    const response = await api.post<Place>('/places', placeData, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.data;
};

/**
 * 장소 비밀번호를 검증합니다.
 * @param id 장소 ID
 * @param password 비밀번호
 */
export const verifyPlacePassword = async (placeId: string, password: string): Promise<void> => {
    const response = await api.post(`/places/${placeId}/verify-password`, {
        password
    });
    return response.data;
};

/**
 * 장소 정보를 수정합니다.
 * @param id 장소 ID
 * @param placeData 수정할 장소 정보 (비밀번호 포함)
 */
export const updatePlace = async (
    placeId: string, 
    updateData: {
        category: PlaceCategory;
        subCategory: SubCategory;
        description: string;
        password: string;
    }
): Promise<Place> => {
    const response = await api.put<Place>(`/places/${placeId}`, updateData);
    return response.data;
};

/**
 * 장소를 삭제합니다.
 * @param id 장소 ID
 * @param password 비밀번호
 */
export const deletePlace = async (id: string, password: string): Promise<void> => {
    await api.delete(`/places/${id}`, {
        data: { password }
    });
};

export const placeApi = {
  // 모든 장소 목록 조회
  getAllPlaces: getAllPlaces,

  // 카테고리별 장소 목록 조회
  getPlacesByCategory: (category: string) =>
    api.get<Place[]>(`/places/category/${category}`),

  // 장소 검색
  searchPlaces: (query: string, page = 0, size = 20) =>
    api.get<Place[]>(`/places/search?query=${query}&page=${page}&size=${size}`),

  // 장소 등록
  createPlace: createPlace,

  // 장소 상세 정보 조회
  getPlaceById: getPlaceById,

  // 비밀번호 검증
  verifyPassword: verifyPlacePassword,

  // 장소 정보 수정
  updatePlace: updatePlace,

  // 장소 삭제
  deletePlace: deletePlace,
} 