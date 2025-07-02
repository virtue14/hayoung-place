'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, UtensilsCrossed, Coffee, Palette, Camera, ShoppingBag, Paintbrush, MoreHorizontal, Map, X, Plus, Eye, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'
import { Place, PlaceCategory, SubCategory, CATEGORY_LABELS, SUBCATEGORY_LABELS, CATEGORY_SUBCATEGORY_MAPPING } from '@/types/place'
import { getAllPlaces } from '@/lib/api/place'
import MapView from '../MapView'
import AddPlaceModal from '@/components/place/AddPlaceModal'
import TabNavigation from '@/components/layout/TabNavigation'
import { cn } from '@/lib/utils'
import { useLocation } from '@/hooks/useLocation'
import { calculateDistance, formatDistance } from '@/lib/utils/location'

// 카테고리 아이콘 매핑
const categoryIcons: Record<PlaceCategory, JSX.Element> = {
    [PlaceCategory.RESTAURANT]: <UtensilsCrossed className="w-full h-full" />,
    [PlaceCategory.CAFE]: <Coffee className="w-full h-full" />,
    [PlaceCategory.GALLERY]: <Paintbrush className="w-full h-full" />,
    [PlaceCategory.PHOTO_SPOT]: <Camera className="w-full h-full" />,
    [PlaceCategory.CULTURE_ACTIVITY]: <Palette className="w-full h-full" />,
    [PlaceCategory.SHOPPING]: <ShoppingBag className="w-full h-full" />,
    [PlaceCategory.OTHER]: <MoreHorizontal className="w-full h-full" />,
};



export default function ListView() {
    const [allPlaces, setAllPlaces] = useState<Place[]>([])
    const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([])
    const [paginatedPlaces, setPaginatedPlaces] = useState<Place[]>([])
    const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | null>(null)
    const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null)
    const [showSubCategories, setShowSubCategories] = useState(false)
    const [isMapOpen, setIsMapOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [isDataLoaded, setIsDataLoaded] = useState(false)
    
    // 현재 위치 정보
    const { latitude, longitude, hasLocation } = useLocation()

    // 거리 계산 함수
    const getDistanceText = (place: Place) => {
        if (!hasLocation || !latitude || !longitude) {
            return null
        }
        
        const [placeLongitude, placeLatitude] = place.location.coordinates
        const distance = calculateDistance(latitude, longitude, placeLatitude, placeLongitude)
        return formatDistance(distance)
    }

    const handlePlaceAdded = () => {
        // 새 장소가 추가되면 전체 데이터를 다시 로드
        loadAllPlaces();
        setIsModalOpen(false);
    };

    // 전체 데이터 로딩 (한 번만)
    const loadAllPlaces = async () => {
        setIsLoading(true);
        try {
            // 전체 데이터를 한 번에 가져옴 (백엔드 카테고리 필터가 작동하지 않음)
            const pageData = await getAllPlaces(0, 1000); // 충분히 큰 size로 전체 데이터 가져오기
            setAllPlaces(pageData.content);
            setIsDataLoaded(true);
        } catch (error) {
            console.error("장소 목록을 불러오는데 실패했습니다.", error)
            setAllPlaces([]);
        } finally {
            setIsLoading(false);
        }
    };

    // 클라이언트 사이드 필터링, 정렬 및 페이징
    const applyFiltersAndPaging = () => {
        if (!isDataLoaded) return;

        // 카테고리 필터링
        let filtered = allPlaces;
        if (selectedCategory) {
            filtered = allPlaces.filter(place => {
                if (selectedSubCategory && selectedSubCategory !== SubCategory.NONE) {
                    return place.category === selectedCategory && place.subCategory === selectedSubCategory;
                }
                return place.category === selectedCategory;
            });
        }

        // 최신순 정렬 (createdAt 기준 내림차순)
        filtered = filtered.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA; // 최신 것이 먼저 오도록
        });

        // 전체 필터링된 결과를 지도용으로 저장
        setFilteredPlaces(filtered);
        
        // 페이징 처리
        const itemsPerPage = 5;
        const startIndex = currentPage * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedContent = filtered.slice(startIndex, endIndex);

        setPaginatedPlaces(paginatedContent);
        setTotalElements(filtered.length);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    };

    // 초기 데이터 로딩
    useEffect(() => {
        loadAllPlaces();
    }, []);

    // 카테고리나 페이지 변경 시 필터링 적용
    useEffect(() => {
        applyFiltersAndPaging();
    }, [allPlaces, selectedCategory, selectedSubCategory, currentPage, isDataLoaded]);
    
    const handleCategoryClick = (category: PlaceCategory) => {
        if (selectedCategory === category) {
            setSelectedCategory(null); // 다시 클릭 시 선택 해제
            setShowSubCategories(false);
            setSelectedSubCategory(null);
        } else {
            setSelectedCategory(category);
            setShowSubCategories(true);
            setSelectedSubCategory(null);
        }
        setCurrentPage(0); // 카테고리 변경 시 첫 페이지로 이동
    }

    const handleSubCategoryClick = (subCategory: SubCategory) => {
        if (selectedSubCategory === subCategory) {
            setSelectedSubCategory(null); // 다시 클릭 시 선택 해제
        } else {
            setSelectedSubCategory(subCategory);
        }
        setCurrentPage(0); // 서브카테고리 변경 시 첫 페이지로 이동
    }

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <>
            <div className="mobile-full-height bg-gray-50">
                {/* 상단 고정 헤더 - 모바일 최적화 */}
                <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-sm z-20 border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                        <div className="flex justify-between items-center h-14 sm:h-16">
                            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">하영플레이스</h1>
                            <Button 
                                onClick={() => setIsModalOpen(true)} 
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm font-medium rounded-lg shadow-sm active:scale-95 transition-all duration-150"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                <span className="hidden xs:inline">장소 등록</span>
                                <span className="xs:hidden">등록</span>
                            </Button>
                        </div>
                    </div>
                </header>

                {/* 탭 네비게이션 */}
                <TabNavigation className="fixed top-14 sm:top-16 left-0 right-0 z-10" />

                <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-[104px] sm:pt-[112px] mobile-container">
                    {/* 카테고리 필터 - 모바일 최적화 */}
                    <div className="mb-4 sm:mb-6 mt-4 sm:mt-6">
                        <div className="flex justify-start gap-1.5 sm:gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            <div className="flex gap-1.5 sm:gap-2 md:gap-3 min-w-max px-1">
                                {(Object.keys(categoryIcons) as PlaceCategory[]).map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => handleCategoryClick(category)}
                                        className={cn(
                                            "flex flex-col items-center justify-center min-w-[70px] w-[70px] h-[70px] sm:min-w-[80px] sm:w-[80px] sm:h-[80px] md:w-[90px] md:h-[90px] rounded-xl sm:rounded-2xl border-2 transition-all duration-200 p-1.5 sm:p-2 touch-manipulation transform-gpu",
                                            selectedCategory === category
                                                ? "border-blue-500 bg-blue-50 text-blue-600 shadow-md scale-105"
                                                : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 shadow-sm hover:scale-105 active:scale-95"
                                        )}
                                    >
                                        <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 mb-1 flex items-center justify-center">
                                            {categoryIcons[category]}
                                        </div>
                                        <span className="text-[10px] sm:text-xs md:text-sm font-medium text-center leading-tight break-keep">
                                            {CATEGORY_LABELS[category]}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2차 카테고리 필터 */}
                        {showSubCategories && selectedCategory && CATEGORY_SUBCATEGORY_MAPPING[selectedCategory] && (
                            <div className="mt-3 animate-in slide-in-from-top-2 duration-300">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">세부 카테고리</h4>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORY_SUBCATEGORY_MAPPING[selectedCategory].map((subCategory) => (
                                        <button
                                            key={subCategory}
                                            onClick={() => handleSubCategoryClick(subCategory)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 touch-manipulation transform-gpu",
                                                selectedSubCategory === subCategory
                                                    ? "border-blue-500 bg-blue-500 text-white shadow-sm"
                                                    : "border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 active:scale-95"
                                            )}
                                        >
                                            {SUBCATEGORY_LABELS[subCategory]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 장소 수 및 지도 토글 */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
                        <div className="text-center sm:text-left">
                            <div className="flex flex-col gap-1">
                                <span className="text-sm sm:text-base font-semibold text-gray-700">
                                   {selectedCategory ? (
                                       selectedSubCategory && selectedSubCategory !== SubCategory.NONE 
                                       ? `${CATEGORY_LABELS[selectedCategory]} > ${SUBCATEGORY_LABELS[selectedSubCategory]}: `
                                       : `${CATEGORY_LABELS[selectedCategory]}: `
                                   ) : '전체: '}
                                   총 {totalElements}개의 장소
                                </span>
                            </div>
                        </div>
                        
                        <Button 
                            variant="outline" 
                            onClick={() => setIsMapOpen(!isMapOpen)} 
                            size="sm" 
                            className="gap-2 self-center sm:self-auto px-4 py-2 rounded-lg active:scale-95 transition-all duration-150"
                        >
                            {isMapOpen ? <X className="h-4 w-4" /> : <Map className="h-4 w-4" />}
                            <span>{isMapOpen ? '지도 접기' : '지도 펼치기'}</span>
                        </Button>
                    </div>

                    {/* 지도 - 모바일 최적화 */}
                    {isMapOpen && (
                        <div className="mb-4 sm:mb-6 h-[350px] sm:h-[400px] md:h-[500px] rounded-lg sm:rounded-xl overflow-hidden shadow-lg border border-gray-200">
                            <MapView places={filteredPlaces} />
                        </div>
                    )}

                    {/* 로딩 상태 */}
                    {isLoading && (
                        <div className="text-center py-8">
                            <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-2 text-sm text-gray-600">장소 목록을 불러오는 중...</p>
                        </div>
                    )}

                    {/* 장소 목록 - 이미지 제거 및 좋아요 수 추가 */}
                    {!isLoading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                            {paginatedPlaces.map((place) => (
                                <Link key={place.id} href={`/places/${place.id}`}>
                                    <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-1 border border-gray-200 rounded-lg sm:rounded-xl active:scale-[0.98] touch-manipulation cursor-pointer">
                                    <CardHeader className="p-3 sm:p-4 pb-2">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1 mr-2">
                                                <CardTitle className="text-sm sm:text-base font-bold text-gray-900 leading-tight mb-1">
                                                    {place.name}
                                                </CardTitle>
                                                <div className="flex items-center gap-1 text-xs">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium">
                                                        {CATEGORY_LABELS[place.category]}
                                                    </span>
                                                    {place.subCategory && place.subCategory !== SubCategory.NONE && (
                                                        <>
                                                            <span className="text-gray-400">〉</span>
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium">
                                                                {SUBCATEGORY_LABELS[place.subCategory]}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full flex-shrink-0">
                                                {CATEGORY_LABELS[place.category]}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-3 sm:p-4 pt-0">
                                        {/* 설명을 먼저 표시 */}
                                        {place.description && (
                                            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed mb-3">
                                                {place.description}
                                            </p>
                                        )}
                                        
                                        {/* 주소를 나중에 표시 */}
                                        <div className="flex items-start space-x-2 text-gray-600 text-xs sm:text-sm mb-3">
                                            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0 text-gray-400" />
                                            <span className="line-clamp-2 leading-relaxed">{place.address}</span>
                                        </div>
                                        
                                        {/* 거리 표시 */}
                                        {getDistanceText(place) && (
                                            <div className="flex items-center space-x-1 text-orange-500 mb-2">
                                                <MapPin className="h-3.5 w-3.5" />
                                                <span className="text-xs font-medium">내 위치에서 {getDistanceText(place)}</span>
                                            </div>
                                        )}
                                        
                                        {/* 조회수 및 댓글 수 표시 */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex items-center space-x-1 text-blue-500">
                                                    <Eye className="h-4 w-4" />
                                                    <span className="text-sm font-medium">{place.viewCount || 0}</span>
                                                    <span className="text-xs text-gray-400 ml-1">조회</span>
                                                </div>
                                                <div className="flex items-center space-x-1 text-green-500">
                                                    <MessageCircle className="h-4 w-4" />
                                                    <span className="text-sm font-medium">{place.commentCount || 0}</span>
                                                    <span className="text-xs text-gray-400 ml-1">댓글</span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {new Date(place.createdAt).toLocaleDateString('ko-KR')}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                            ))}
                        </div>
                    )}
                    
                    {/* 페이지네이션 */}
                    {!isLoading && totalPages > 1 && (
                        <div className="flex justify-center items-center mt-8 space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                                className="px-3 py-2"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            
                            <div className="flex space-x-1">
                                {(() => {
                                    const pageGroupSize = 5;
                                    const currentGroup = Math.floor(currentPage / pageGroupSize);
                                    const startPage = currentGroup * pageGroupSize;
                                    const endPage = Math.min(startPage + pageGroupSize - 1, totalPages - 1);
                                    
                                    const pages = [];
                                    for (let i = startPage; i <= endPage; i++) {
                                        pages.push(
                                            <Button
                                                key={i}
                                                variant={currentPage === i ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handlePageChange(i)}
                                                className="px-3 py-2 min-w-[40px]"
                                            >
                                                {i + 1}
                                            </Button>
                                        );
                                    }
                                    return pages;
                                })()}
                            </div>
                            
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages - 1}
                                className="px-3 py-2"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                    
                    {/* 빈 상태 - 모바일 최적화 */}
                    {!isLoading && paginatedPlaces.length === 0 && (
                        <div className="text-center py-12 sm:py-16 text-gray-500">
                            <div className="flex flex-col items-center space-y-3">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                    <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                                </div>
                                <p className="text-sm sm:text-base">표시할 장소가 없습니다.</p>
                                <Button 
                                    onClick={() => setIsModalOpen(true)}
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                >
                                    첫 번째 장소 등록하기
                                </Button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
            <AddPlaceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onPlaceAdded={handlePlaceAdded} />
        </>
    )
} 