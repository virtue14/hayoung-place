'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, UtensilsCrossed, Coffee, Palette, Camera, ShoppingBag, Paintbrush, MoreHorizontal, Map, X, Plus, Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import { Place, PlaceCategory } from '@/types/place'
import { getAllPlaces } from '@/lib/api/place'
import MapView from '../MapView'
import AddPlaceModal from '@/components/place/AddPlaceModal'
import TabNavigation from '@/components/layout/TabNavigation'
import { cn } from '@/lib/utils'

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

// 카테고리 한글 매핑
const categoryNames: Record<PlaceCategory, string> = {
    [PlaceCategory.RESTAURANT]: '맛집',
    [PlaceCategory.CAFE]: '카페',
    [PlaceCategory.GALLERY]: '미술관/전시',
    [PlaceCategory.PHOTO_SPOT]: '포토스팟',
    [PlaceCategory.CULTURE_ACTIVITY]: '문화 · 체험',
    [PlaceCategory.SHOPPING]: '쇼핑',
    [PlaceCategory.OTHER]: '기타',
}

export default function ListView() {
    const [allPlaces, setAllPlaces] = useState<Place[]>([])
    const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([])
    const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | null>(null)
    const [isMapOpen, setIsMapOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    const handlePlaceAdded = (newPlace: Place) => {
        // 새 장소가 추가되면 첫 페이지로 이동하고 다시 로드
        setCurrentPage(0);
        fetchPlaces(0, selectedCategory);
        setIsModalOpen(false);
    };

    // 데이터 로딩
    const fetchPlaces = async (page: number = 0, category: PlaceCategory | null = null) => {
        setIsLoading(true);
        try {
            const pageData = await getAllPlaces(page, 5); // 페이지당 5개
            setAllPlaces(pageData.content);
            setFilteredPlaces(pageData.content);
            setTotalPages(pageData.totalPages);
            setTotalElements(pageData.totalElements);
            setCurrentPage(page);
        } catch (error) {
            console.error("장소 목록을 불러오는데 실패했습니다.", error)
            setAllPlaces([]);
            setFilteredPlaces([]);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPlaces(0, selectedCategory);
    }, []);

    // 카테고리 필터링 로직
    useEffect(() => {
        // 카테고리가 변경되면 첫 페이지로 이동
        setCurrentPage(0);
        fetchPlaces(0, selectedCategory);
    }, [selectedCategory]);
    
    const handleCategoryClick = (category: PlaceCategory) => {
        if (selectedCategory === category) {
            setSelectedCategory(null); // 다시 클릭 시 선택 해제
        } else {
            setSelectedCategory(category);
        }
    }

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchPlaces(newPage, selectedCategory);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50">
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

                <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-[104px] sm:pt-[112px] pb-6 sm:pb-8">
                    {/* 카테고리 필터 - 모바일 최적화 */}
                    <div className="mb-4 sm:mb-6 mt-4 sm:mt-6">
                        <div className="flex justify-start gap-1.5 sm:gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            <div className="flex gap-1.5 sm:gap-2 md:gap-3 min-w-max px-1">
                                {(Object.keys(categoryIcons) as PlaceCategory[]).map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => handleCategoryClick(category)}
                                        className={cn(
                                            "flex flex-col items-center justify-center min-w-[70px] w-[70px] h-[70px] sm:min-w-[80px] sm:w-[80px] sm:h-[80px] md:w-[90px] md:h-[90px] rounded-xl sm:rounded-2xl border-2 transition-all duration-200 p-1.5 sm:p-2 active:scale-95 touch-manipulation",
                                            selectedCategory === category
                                                ? "border-blue-500 bg-blue-50 text-blue-600 shadow-md scale-105"
                                                : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 shadow-sm"
                                        )}
                                    >
                                        <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 mb-1 flex items-center justify-center">
                                            {categoryIcons[category]}
                                        </div>
                                        <span className="text-[10px] sm:text-xs md:text-sm font-medium text-center leading-tight break-keep">
                                            {categoryNames[category]}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 장소 수 및 지도 토글 */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
                        <div className="text-center sm:text-left">
                            <span className="text-sm sm:text-base font-semibold text-gray-700">
                               {selectedCategory ? `${categoryNames[selectedCategory]}: ` : '전체: '}
                               총 {totalElements}개의 장소
                            </span>
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
                            {filteredPlaces.map((place) => (
                                <Link key={place.id} href={`/places/${place.id}`}>
                                    <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-1 border border-gray-200 rounded-lg sm:rounded-xl active:scale-[0.98] touch-manipulation cursor-pointer">
                                    <CardHeader className="p-3 sm:p-4 pb-2">
                                        <div className="flex justify-between items-start mb-2">
                                            <CardTitle className="text-sm sm:text-base font-bold text-gray-900 leading-tight flex-1 mr-2">
                                                {place.name}
                                            </CardTitle>
                                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full flex-shrink-0">
                                                {categoryNames[place.category]}
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
                                        
                                        {/* 찜하기 수 표시 (추후 로그인 기능 연동 예정) */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-1 text-red-500">
                                                <Heart className="h-4 w-4" />
                                                <span className="text-sm font-medium">{place.likesCount || 0}</span>
                                                <span className="text-xs text-gray-400 ml-1">찜</span>
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
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <Button
                                        key={i}
                                        variant={currentPage === i ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handlePageChange(i)}
                                        className="px-3 py-2 min-w-[40px]"
                                    >
                                        {i + 1}
                                    </Button>
                                ))}
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
                    {!isLoading && filteredPlaces.length === 0 && (
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