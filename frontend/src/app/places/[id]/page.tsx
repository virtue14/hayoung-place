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
  Eye,
  UtensilsCrossed, 
  Coffee, 
  Palette, 
  Camera, 
  ShoppingBag, 
  Paintbrush, 
  MoreHorizontal,
  Edit2,
  Trash2
} from 'lucide-react'
import { Place, PlaceCategory, SubCategory, CATEGORY_LABELS, SUBCATEGORY_LABELS } from '@/types/place'
import { getPlaceById, deletePlace } from '@/lib/api/place'
import PlaceDetailMap from '@/components/place/PlaceDetailMap'
import PasswordModal from '@/components/place/PasswordModal'
import EditPlaceModal from '@/components/place/EditPlaceModal'
import CommentSection from '@/components/comment/CommentSection'
import { useLocation } from '@/hooks/useLocation'
import { calculateDistance, formatDistance } from '@/lib/utils/location'

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



export default function PlaceDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [place, setPlace] = useState<Place | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    
    // 현재 위치 정보
    const { latitude, longitude, hasLocation } = useLocation()

    // 거리 계산 함수
    const getDistanceText = () => {
        if (!hasLocation || !latitude || !longitude || !place) {
            return null
        }
        
        const [placeLongitude, placeLatitude] = place.location.coordinates
        const distance = calculateDistance(latitude, longitude, placeLatitude, placeLongitude)
        return formatDistance(distance)
    }

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
            } catch (error: unknown) {
                console.error('장소 정보를 불러오는데 실패했습니다:', error)
                const errorResponse = error as { response?: { status?: number } }
                if (errorResponse.response?.status === 404) {
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

    const handleEdit = () => {
        setShowEditModal(true)
    }

    const handleDelete = () => {
        setShowPasswordModal(true)
    }

    const handlePasswordConfirm = async (password: string) => {
        setShowPasswordModal(false)
        await handleConfirmDelete(password)
    }

    const handlePlaceUpdated = (updatedPlace: Place) => {
        setPlace(updatedPlace)
        setShowEditModal(false)
    }

    const handleConfirmDelete = async (password: string) => {
        if (!place?.id) return

        try {
            await deletePlace(place.id, password)
            alert('장소가 성공적으로 삭제되었습니다.')
            router.back()
        } catch (error: unknown) {
            console.error('장소 삭제 중 오류가 발생했습니다:', error)
            alert('장소 삭제 중 오류가 발생했습니다. 다시 시도해주세요.')
        }
    }

    if (isLoading) {
        return (
            <div className="mobile-full-height bg-gray-50 flex items-center justify-center mobile-container">
                <div className="text-center">
                    <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">장소 정보를 불러오는 중...</p>
                </div>
            </div>
        )
    }

    if (error || !place) {
        return (
            <div className="mobile-full-height bg-gray-50 flex items-center justify-center mobile-container">
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
        <div className="mobile-full-height bg-gray-50">
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

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mobile-container">
                {/* 메인 정보 카드 */}
                <Card className="mb-6 shadow-lg border-0">
                    <CardHeader className="pb-4">
                        {/* 등록일과 조회수 - 상단 좌우 배치 */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-500">
                                    {new Date(place.createdAt).toLocaleDateString('ko-KR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                            
                            {/* 조회수 표시 - 등록일 선상 우측 */}
                            <div className="flex items-center gap-2 px-3 py-1 rounded-lg flex-shrink-0">
                                <Eye className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">{place.viewCount || 0}</span>
                                <span className="text-xs text-gray-500">조회</span>
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-4">
                            {/* 제목 영역 */}
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                                    {categoryIcons[place.category]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight mb-2">
                                        {place.name}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
                                            {CATEGORY_LABELS[place.category]}
                                        </span>
                                        {place.subCategory && place.subCategory !== SubCategory.NONE && (
                                            <>
                                                <span className="text-gray-400 text-sm">〉</span>
                                                <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full">
                                                    {SUBCATEGORY_LABELS[place.subCategory]}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="">
                        {/* 설명 */}
                        {place.description && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">장소 소개</h3>
                                <p className="text-gray-700 leading-relaxed text-base">
                                    {place.description}
                                </p>
                            </div>
                        )}

                        {/* 위치 정보 */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-gray-900">위치 정보</h3>
                                {place.placeUrl && (
                                    <Button
                                        size="sm"
                                        onClick={handleOpenInKakao}
                                        className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 border-yellow-400 hover:border-yellow-500"
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        카카오맵에서 보기
                                    </Button>
                                )}
                            </div>
                            <div className="flex items-start gap-3 p-4 rounded-lg">
                                <MapPin className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-gray-700 font-medium">{place.address}</p>
                                </div>
                            </div>
                        </div>

                        {/* 지도 영역 */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-gray-900">지도</h3>
                                {getDistanceText() && (
                                    <div className="flex items-center gap-1 text-orange-600">
                                        <MapPin className="w-4 h-4" />
                                        <span className="text-sm font-medium">내 위치에서 {getDistanceText()}</span>
                                    </div>
                                )}
                            </div>
                            <div className="w-full h-[300px] sm:h-[350px] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                <PlaceDetailMap place={place} className="w-full h-full" />
                            </div>
                        </div>

                        {/* 액션 버튼들 */}
                        <div className="pt-4 border-t border-gray-200">
                            {/* 수정/삭제 버튼 */}
                            <div className="flex gap-3 mb-6">
                                <Button
                                    variant="outline"
                                    onClick={handleEdit}
                                    className="flex-1 bg-white hover:bg-blue-50 border-blue-300 text-blue-600 hover:text-blue-700 px-4 py-3 rounded-lg transition-colors h-12"
                                >
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    수정
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleDelete}
                                    className="flex-1 bg-white hover:bg-red-50 border-red-300 text-red-600 hover:text-red-700 px-4 py-3 rounded-lg transition-colors h-12"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    삭제
                                </Button>
                            </div>
                            
                            {/* 목록으로 돌아가기 버튼 */}
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                className="w-full h-12 text-gray-700 border-gray-300 hover:bg-gray-50"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                목록으로 돌아가기
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* 댓글 섹션 */}
                <Card className="shadow-lg border-0">
                    <CardContent className="pb-6 pl-6 pr-6">
                        <CommentSection placeId={place.id!} />
                    </CardContent>
                </Card>

                {/* 비밀번호 확인 모달 */}
                <PasswordModal
                    isOpen={showPasswordModal}
                    onClose={() => setShowPasswordModal(false)}
                    onConfirm={handlePasswordConfirm}
                    title="장소 삭제"
                    description="장소를 삭제하려면 비밀번호를 입력해주세요."
                />

                <EditPlaceModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    place={place}
                    onPlaceUpdated={handlePlaceUpdated}
                />
            </main>
        </div>
    )
} 