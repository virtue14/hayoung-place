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
import { Place, PlaceCategory } from '@/types/place'
import { getPlaceById, verifyPlacePassword, deletePlace } from '@/lib/api/place'
import PlaceDetailMap from '@/components/place/PlaceDetailMap'
import PasswordModal from '@/components/place/PasswordModal'

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
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
    const [passwordModalType, setPasswordModalType] = useState<'edit' | 'delete'>('edit')
    const [isPasswordLoading, setIsPasswordLoading] = useState(false)

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
                const errorResponse = error as any
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

    const handleEditClick = () => {
        setPasswordModalType('edit')
        setIsPasswordModalOpen(true)
    }

    const handleDeleteClick = () => {
        setPasswordModalType('delete')
        setIsPasswordModalOpen(true)
    }

    const handlePasswordConfirm = async (password: string) => {
        if (!place?.id) return

        setIsPasswordLoading(true)
        try {
            // 비밀번호 검증
            await verifyPlacePassword(place.id, password)
            
            if (passwordModalType === 'edit') {
                // 수정 페이지로 이동 (추후 구현)
                alert('수정 기능은 추후 구현 예정입니다.')
            } else if (passwordModalType === 'delete') {
                // 삭제 실행
                await deletePlace(place.id, password)
                alert('장소가 성공적으로 삭제되었습니다.')
                router.back()
            }
            
            setIsPasswordModalOpen(false)
        } catch (error: unknown) {
            const errorResponse = error as any
            if (errorResponse.response?.status === 401) {
                alert('비밀번호가 일치하지 않습니다.')
            } else {
                alert('오류가 발생했습니다. 다시 시도해주세요.')
            }
        } finally {
            setIsPasswordLoading(false)
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
                            
                            {/* 조회수 표시 */}
                            <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
                                <Eye className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">{place.viewCount || 0}</span>
                                <span className="text-xs text-gray-500">조회</span>
                            </div>
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
                            <div className="w-full h-[300px] sm:h-[350px] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
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
                                <Eye className="w-5 h-5 text-blue-500" />
                                <div>
                                    <p className="text-sm text-gray-500">조회수</p>
                                    <p className="font-medium text-gray-900">{place.viewCount || 0}회 조회됨</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 하단 액션 버튼들 */}
                <div className="flex flex-col gap-3">
                    {/* 첫 번째 줄: 수정/삭제 버튼 */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handleEditClick}
                            className="flex-1"
                        >
                            <Edit2 className="w-4 h-4 mr-2" />
                            수정하기
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteClick}
                            className="flex-1"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            삭제하기
                        </Button>
                    </div>
                    
                    {/* 두 번째 줄: 목록/카카오맵 버튼 */}
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
                </div>

                {/* 비밀번호 확인 모달 */}
                <PasswordModal
                    isOpen={isPasswordModalOpen}
                    onClose={() => setIsPasswordModalOpen(false)}
                    onConfirm={handlePasswordConfirm}
                    title={passwordModalType === 'edit' ? '장소 수정' : '장소 삭제'}
                    description={
                        passwordModalType === 'edit'
                            ? '장소를 수정하려면 등록 시 설정한 비밀번호를 입력해주세요.'
                            : '장소를 삭제하려면 등록 시 설정한 비밀번호를 입력해주세요.'
                    }
                    isLoading={isPasswordLoading}
                />
            </main>
        </div>
    )
} 