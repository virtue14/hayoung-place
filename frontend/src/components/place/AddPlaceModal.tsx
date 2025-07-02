'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Place, 
  PlaceCategory, 
  SubCategory,
  KakaoPlaceSearchResult, 
  CATEGORY_LABELS,
  SUBCATEGORY_LABELS,
  CATEGORY_SUBCATEGORY_MAPPING
} from '@/types/place';
import { useDebounce } from '@/hooks/useDebounce';
import { createPlace } from '@/lib/api/place';
import { Search } from 'lucide-react';
import { useKakaoMap } from "@/hooks/useKakaoMap";



interface AddPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceAdded: (place: Place) => void;
}

export default function AddPlaceModal({ isOpen, onClose, onPlaceAdded }: AddPlaceModalProps) {
  // 상태 관리
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<KakaoPlaceSearchResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<KakaoPlaceSearchResult | null>(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PlaceCategory | ''>('');
  const [subCategory, setSubCategory] = useState<SubCategory | ''>('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  
  // 검색어 디바운스
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { isLoaded } = useKakaoMap();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  // 컴포넌트가 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSearchResults([]);
      setSelectedPlace(null);
      setDescription('');
      setCategory('');
      setSubCategory('');
      setPassword('');
      setIsLoading(false);
    }
  }, [isOpen]);

  // 1차 카테고리 변경 시 2차 카테고리 초기화
  useEffect(() => {
    setSubCategory('');
  }, [category]);

  // 장소 검색
  useEffect(() => {
    const searchPlaces = async () => {
      if (debouncedSearchTerm) {
        try {
          const response = await fetch(
            `/api/kakao/places/search?query=${debouncedSearchTerm}`
          );
          const data = await response.json();
          setSearchResults(data.documents);
        } catch (error) {
          console.error("장소 검색 중 오류 발생:", error);
        }
      } else {
        setSearchResults([]);
      }
    };

    searchPlaces();
  }, [debouncedSearchTerm]);

  // 지도 표시
  useEffect(() => {
    if (selectedPlace && mapContainerRef.current && isLoaded) {
      // 기존 마커 정리
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }

      const coords = new window.kakao.maps.LatLng(
        parseFloat(selectedPlace.y),
        parseFloat(selectedPlace.x)
      );

      if (!mapRef.current) {
        const options = {
          center: coords,
          level: 3,
        };
        const map = new window.kakao.maps.Map(mapContainerRef.current, options);
        mapRef.current = map;

        const marker = new window.kakao.maps.Marker({
          position: coords,
        });
        marker.setMap(map);
        markerRef.current = marker;
      } else {
        mapRef.current.setCenter(coords);
        const marker = new window.kakao.maps.Marker({
          position: coords,
        });
        marker.setMap(mapRef.current);
        markerRef.current = marker;
      }
    }
  }, [selectedPlace, isLoaded]);

  // 선택된 장소가 없을 때 지도 정리
  useEffect(() => {
    if (!selectedPlace) {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (mapRef.current && mapContainerRef.current) {
        mapContainerRef.current.innerHTML = '';
        mapRef.current = null;
      }
    }
  }, [selectedPlace]);

  const handleSelectPlace = (place: KakaoPlaceSearchResult) => {
    setSelectedPlace(place);
    setSearchTerm(place.place_name);
    setSearchResults([]);
  };

  // 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlace || !category || !subCategory || !description || !password) {
      alert('모든 필드를 채워주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const placeData = {
        name: selectedPlace.place_name,
        address: selectedPlace.address_name,
        placeUrl: selectedPlace.place_url,
        longitude: parseFloat(selectedPlace.x),
        latitude: parseFloat(selectedPlace.y),
        category: category,
        subCategory: subCategory,
        description,
        password,
      };

      const newPlace = await createPlace(placeData);
      onPlaceAdded(newPlace);
      onClose();
    } catch (error: unknown) {
      console.error('장소 등록 중 오류 발생:', error);
      
      // 서버에서 반환된 오류 메시지 확인
      const errorResponse = error as { response?: { status?: number; data?: { message?: string } } };
      if (errorResponse.response?.status === 409) {
        // HTTP 409 Conflict - 중복된 장소
        const errorMessage = errorResponse.response?.data?.message || '이미 등록된 장소입니다.';
        alert(errorMessage);
      } else if (errorResponse.response?.status === 400) {
        // HTTP 400 Bad Request - 잘못된 요청
        const errorMessage = errorResponse.response?.data?.message || '잘못된 요청입니다. 입력 정보를 확인해주세요.';
        alert(errorMessage);
      } else if (errorResponse.response?.status && errorResponse.response.status >= 500) {
        // HTTP 5xx - 서버 오류
        alert('서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        // 기타 오류 (네트워크 오류 등)
        alert('장소 등록에 실패했습니다. 네트워크 연결을 확인하고 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 현재 선택된 1차 카테고리에 따른 2차 카테고리 옵션들
  const availableSubCategories = category ? CATEGORY_SUBCATEGORY_MAPPING[category as PlaceCategory] : [];

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] max-w-[900px] h-[85vh] sm:h-[80vh] max-h-[700px] flex flex-col bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl p-0 overflow-hidden">
        <DialogHeader className="border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 flex-shrink-0">
          <DialogTitle className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">새로운 장소 등록</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 space-y-3 min-h-0">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1.5">장소 검색</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="가게, 명소 이름으로 검색"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (selectedPlace) setSelectedPlace(null);
                  }}
                  className="pl-9 h-10 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="relative">
                  <ul className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-xl">
                    <li className="p-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 sticky top-0">
                      총 {searchResults.length}개
                    </li>
                    {searchResults.map(place => (
                      <li 
                        key={place.id} 
                        onClick={() => handleSelectPlace(place)} 
                        className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors active:bg-blue-100 dark:active:bg-blue-900/30"
                      >
                        <p className="font-semibold text-gray-900 dark:text-white text-xs">{place.place_name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-1">{place.road_address_name || place.address_name}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {selectedPlace && (
              <div className="p-3 border border-blue-200 dark:border-blue-700 rounded-lg space-y-2 bg-blue-50 dark:bg-blue-900/10">
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">{selectedPlace.place_name}</h3>
                  <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                    {selectedPlace.road_address_name || selectedPlace.address_name}
                  </p>
                </div>
                <div ref={mapContainerRef} className="w-full h-32 sm:h-40 rounded-md border border-gray-300 dark:border-gray-600" />
              </div>
            )}

            {/* 1차 카테고리 선택 */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1.5">1차 카테고리</label>
              <Select value={category} onValueChange={(value: PlaceCategory) => setCategory(value)} required>
                <SelectTrigger id="category" className="h-10 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg">
                  <SelectValue placeholder="장소 종류 선택" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg max-h-48">
                  {Object.entries(CATEGORY_LABELS).map(([key, name]) => (
                    <SelectItem 
                      key={key} 
                      value={key} 
                      className="hover:bg-gray-100 dark:hover:bg-gray-700 text-sm py-2 cursor-pointer"
                    >
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2차 카테고리 선택 - 1차 카테고리 선택 후에만 표시 */}
            {category && availableSubCategories.length > 0 && (
              <div>
                <label htmlFor="subcategory" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1.5">2차 카테고리</label>
                <Select value={subCategory} onValueChange={(value: SubCategory) => setSubCategory(value)} required>
                  <SelectTrigger id="subcategory" className="h-10 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg">
                    <SelectValue placeholder="세부 카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg max-h-48">
                    {availableSubCategories.map((subCat) => (
                      <SelectItem 
                        key={subCat} 
                        value={subCat} 
                        className="hover:bg-gray-100 dark:hover:bg-gray-700 text-sm py-2 cursor-pointer"
                      >
                        {SUBCATEGORY_LABELS[subCat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1.5">장소 설명</label>
              <Textarea
                id="description"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 h-20 sm:h-24 text-sm rounded-lg resize-none"
                placeholder="추천 이유, 특징, 꿀팁 등을 적어주세요."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1.5">비밀번호</label>
              <Input
                id="password"
                type="password"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 h-10 text-sm rounded-lg"
                placeholder="글 수정/삭제 시 사용할 비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                나중에 이 글을 수정하거나 삭제할 때 필요합니다.
              </p>
            </div>
          </div>
          
          <DialogFooter className="border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
            <div className="flex gap-2 w-full">
              <DialogClose asChild>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 h-10 text-sm rounded-lg border-gray-300 hover:bg-gray-50 active:scale-95 transition-all duration-150"
                >
                  취소
                </Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-10 text-sm rounded-lg shadow-sm active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center gap-1.5">
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    등록 중...
                  </span>
                ) : (
                  '등록하기'
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 