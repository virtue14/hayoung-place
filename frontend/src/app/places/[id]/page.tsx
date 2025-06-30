'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  MapPin, 
  ArrowLeft, 
  ExternalLink, 
  Calendar, 
  Heart, 
  UtensilsCrossed, 
  Coffee, 
  Palette, 
  Camera, 
  ShoppingBag, 
  Paintbrush, 
  MoreHorizontal
} from 'lucide-react'
import { Place, PlaceCategory } from '@/types/place'
import { getPlaceById } from '@/lib/api/place'
import PlaceDetailMap from '@/components/place/PlaceDetailMap'

// 카테고리 아이콘 매핑
const categoryIcons: Record<PlaceCategory, JSX.Element> = {
    [PlaceCategory.RESTAURANT]: <UtensilsCrossed className="w-6 h-6" />,
    [PlaceCategory.CAFE]: <Coffee className="w-6 h-6" />,
    [PlaceCategory.GALLERY]: <Paintbrush className="w-6 h-6" />,
    [PlaceCategory.PHOTO_SPOT]: <Camera className="w-6 h-6" />,
    [PlaceCategory.CULTURE_ACTIVITY]: <Palette className="w-6 h-6" />,
    [PlaceCategory.SHOPPING]: <ShoppingBag className="w-6 h-6" />,
    [PlaceCategory.OTHER]: <MoreHorizontal className="w-6 h-6" />,
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

export default function PlaceDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [place, setPlace] = useState<Place | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchPlace = async () => {
            if (!params.id || typeof params.id !== 'string') {
                setError('잘못된 장소 ID입니다.')
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true)
                const placeData = await getPlaceById(params.id)
                setPlace(placeData)
            } catch (error: any) {
                console.error('장소 정보를 불러오는데 실패했습니다:', error)
                if (error.response?.status === 404) {
                    setError('장소를 찾을 수 없습니다.')
                } else {
                    setError('장소 정보를 불러오는데 실패했습니다.')
                }
            } finally {
                setIsLoading(false)
            }
        }

        fetchPlace()
    }, [params.id])

    const handleBack = () => {
        router.back()
    }

    const handleOpenInKakao = () => {
        if (place?.placeUrl) {
            window.open(place.placeUrl, '_blank')
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">장소 정보를 불러오는 중...</p>
                </div>
            </div>
        )
    }

    if (error || !place) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <MapPin className="w-8 h-8 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">장소를 찾을 수 없습니다</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Button onClick={handleBack} variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        돌아가기
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 상단 헤더 */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14 sm:h-16">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBack}
                            className="flex items-center gap-2 hover:bg-gray-100"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">뒤로가기</span>
                        </Button>
                        
                        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate px-4">
                            장소 상세정보
                        </h1>
                        
                        <div className="w-[88px]"></div> {/* 균형을 위한 빈 공간 */}
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* 메인 정보 카드 */}
                <Card className="mb-6 shadow-lg border-0">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                                        {categoryIcons[place.category]}
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                                            {place.name}
                                        </CardTitle>
                                        <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full mt-1">
                                            {categoryNames[place.category]}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* 찜하기 버튼 (추후 기능 구현) */}
                            <Button variant="outline" size="sm" className="flex items-center gap-2" disabled>
                                <Heart className="w-4 h-4 text-red-500" />
                                <span>{place.likesCount || 0}</span>
                                <span className="text-xs text-gray-500">찜</span>
                            </Button>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                        {/* 설명 */}
                        {place.description && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">장소 소개</h3>
                                <p className="text-gray-700 leading-relaxed text-base">
                                    {place.description}
                                </p>
                            </div>
                        )}

                        {/* 위치 정보 */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">위치 정보</h3>
                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                <MapPin className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-gray-700 font-medium">{place.address}</p>
                                    {place.placeUrl && (
                                        <Button
                                            variant="link"
                                            size="sm"
                                            onClick={handleOpenInKakao}
                                            className="px-0 text-blue-600 hover:text-blue-700 mt-2"
                                        >
                                            <ExternalLink className="w-4 h-4 mr-1" />
                                            카카오맵에서 보기
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 지도 영역 */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">지도</h3>
                            <div className="w-full h-64 sm:h-80 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                <PlaceDetailMap place={place} className="rounded-lg" />
                            </div>
                        </div>

                        {/* 기타 정보 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-500">등록일</p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(place.createdAt).toLocaleDateString('ko-KR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <Heart className="w-5 h-5 text-red-500" />
                                <div>
                                    <p className="text-sm text-gray-500">찜하기</p>
                                    <p className="font-medium text-gray-900">{place.likesCount || 0}명이 찜했어요</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 하단 액션 버튼들 */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        className="flex-1 sm:flex-none"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        목록으로 돌아가기
                    </Button>
                    
                    {place.placeUrl && (
                        <Button
                            onClick={handleOpenInKakao}
                            className="flex-1 sm:flex-none bg-yellow-400 hover:bg-yellow-500 text-yellow-900"
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            카카오맵에서 보기
                        </Button>
                    )}
                </div>
            </main>
        </div>
    )
} 