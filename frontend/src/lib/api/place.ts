import { api } from './axios'
import { Page, Place, PlaceCategory } from '@/types/place'

/**
 * 등록된 모든 장소 목록을 조회합니다.
 * @param page 페이지 번호 (0부터 시작)
 * @param size 페이지 크기
 */
export const getAllPlaces = async (page: number = 0, size: number = 5): Promise<Page<Place>> => {
    const response = await api.get<Page<Place>>(`/api/places?page=${page}&size=${size}`)
    return response.data
}

/**
 * 특정 장소의 상세 정보를 조회합니다.
 * @param id 장소 ID
 */
export const getPlaceById = async (id: string): Promise<Place> => {
    const response = await api.get<Place>(`/api/places/${id}`)
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
}

/**
 * 새로운 장소를 등록합니다.
 * @param placeData 장소 정보 객체
 */
export const createPlace = async (placeData: CreatePlaceRequest): Promise<Place> => {
    const response = await api.post<Place>('/api/places', placeData, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.data;
};

export const placeApi = {
  // 모든 장소 목록 조회
  getAllPlaces: getAllPlaces,

  // 카테고리별 장소 목록 조회
  getPlacesByCategory: (category: string) =>
    api.get<Place[]>(`/api/places/category/${category}`),

  // 장소 검색
  searchPlaces: (query: string, page = 0, size = 20) =>
    api.get<Place[]>(`/api/places/search?query=${query}&page=${page}&size=${size}`),

  // 장소 등록
  createPlace: createPlace,

  // 장소 상세 정보 조회
  getPlaceById: getPlaceById,

  // 장소 정보 수정
  updatePlace: (id: string, place: Place) =>
    api.put<Place>(`/api/places/${id}`, place),

  // 장소 삭제
  deletePlace: (id: string) =>
    api.delete(`/api/places/${id}`),
} 