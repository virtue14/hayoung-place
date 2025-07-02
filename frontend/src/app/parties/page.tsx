'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, Calendar, MapPin, ChevronLeft, ChevronRight, Crown } from 'lucide-react'
import { partyApi } from '@/lib/api/party'
import { Party, PartyStatus } from '@/types/party'
import Link from 'next/link'
import AddPartyModal from '@/components/party/AddPartyModal'
import TabNavigation from '@/components/layout/TabNavigation'

export default function PartiesPage() {
  const [parties, setParties] = useState<Party[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const loadParties = async (page: number) => {
    try {
      setIsLoading(true)
      const response = await partyApi.getParties(page, 5)
      setParties(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
      setCurrentPage(page)
    } catch (err) {
      setError('파티 목록을 불러오는데 실패했습니다.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadParties(0)
  }, [])

  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      loadParties(page)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDDayText = (dDay?: number) => {
    if (dDay === undefined || dDay === null) return ''
    if (dDay === 0) return 'D-Day'
    if (dDay > 0) return `D-${dDay}`
    return `D+${Math.abs(dDay)}`
  }

  const getDDayColor = (dDay?: number) => {
    if (dDay === undefined || dDay === null) return 'bg-gray-100 text-gray-600'
    if (dDay === 0) return 'bg-red-100 text-red-600'
    if (dDay > 0 && dDay <= 3) return 'bg-orange-100 text-orange-600'
    if (dDay > 3) return 'bg-blue-100 text-blue-600'
    return 'bg-gray-100 text-gray-600'
  }

  // 페이지네이션 그룹 계산 (1-5, 6-10 형태)
  const getPageGroups = () => {
    const groups = []
    for (let i = 0; i < totalPages; i += 5) {
      groups.push({
        start: i,
        end: Math.min(i + 4, totalPages - 1),
        pages: Array.from({ length: Math.min(5, totalPages - i) }, (_, index) => i + index)
      })
    }
    return groups
  }

  const getCurrentGroup = () => {
    const groupIndex = Math.floor(currentPage / 5)
    const groups = getPageGroups()
    return groups[groupIndex]
  }

  const canGoPrevGroup = () => {
    return currentPage >= 5
  }

  const canGoNextGroup = () => {
    return currentPage < totalPages - 5
  }

  const goToPrevGroup = () => {
    const newPage = Math.max(0, currentPage - 5)
    handlePageChange(newPage)
  }

  const goToNextGroup = () => {
    const newPage = Math.min(totalPages - 1, currentPage + 5)
    handlePageChange(newPage)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">파티 목록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <Button onClick={() => loadParties(0)} className="mt-4">
            다시 시도
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* 상단 고정 헤더 */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-sm z-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">하영플레이스</h1>
            <Button 
              onClick={() => setShowAddModal(true)} 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm font-medium rounded-lg shadow-sm active:scale-95 transition-all duration-150"
            >
              <Plus className="w-4 h-4 mr-1" />
              <span className="hidden xs:inline">파티 만들기</span>
              <span className="xs:hidden">만들기</span>
            </Button>
          </div>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <TabNavigation className="fixed top-14 sm:top-16 left-0 right-0 z-10" />

      <div className="bg-gray-50 min-h-screen">
        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-[104px] sm:pt-[112px]">
          {/* 파티 목록 섹션 */}
          <div className="mt-4 sm:mt-6">
            <div className="mb-6">
              <p className="text-gray-600 mt-2">
                총 {totalElements}개의 모집글
              </p>
            </div>

            {/* 파티 목록 */}
            <div className="grid gap-6">
              {parties.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    등록된 파티가 없습니다
                  </h3>
                  <p className="text-gray-500 mb-4">
                    첫 번째 파티를 만들어보세요!
                  </p>
                  <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    파티 만들기
                  </Button>
                </div>
              ) : (
                parties.map((party) => (
                  <Link key={party.id} href={`/parties/${party.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {party.title}
                                </h3>
                                {party.dDay !== undefined && (
                                  <Badge className={getDDayColor(party.dDay)}>
                                    {getDDayText(party.dDay)}
                                  </Badge>
                                )}
                              </div>
                              <Badge
                                variant={party.status === PartyStatus.RECRUITING ? 'default' : 'secondary'}
                                className={
                                  party.status === PartyStatus.RECRUITING
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }
                              >
                                {party.status === PartyStatus.RECRUITING ? '모집중' : '모집완료'}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-3 line-clamp-2 text-sm">
                              {party.description}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {/* 위치 */}
                          <div className="flex items-center text-gray-600 text-sm">
                            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>{party.location}</span>
                          </div>
                          
                          {/* 일시 */}
                          <div className="flex items-center text-gray-600 text-sm">
                            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>{formatDate(party.date)}</span>
                          </div>
                          
                          {/* 인원 */}
                          <div className="flex items-center text-gray-600 text-sm">
                            <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>
                              {party.currentMembers}
                              {party.maxMembers ? `/${party.maxMembers}명` : '명 (제한없음)'}
                            </span>
                          </div>
                          
                          {/* 파티장과 작성일 */}
                          <div className="flex items-center justify-between text-gray-600 text-sm">
                            <div className="flex items-center">
                              <Crown className="w-4 h-4 mr-2 flex-shrink-0 text-yellow-500" />
                              <span>{party.nickname}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(party.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                        </div>

                        {/* 태그 */}
                        {party.tags && party.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {party.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevGroup}
                  disabled={!canGoPrevGroup()}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {getCurrentGroup()?.pages.map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className={
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : ''
                    }
                  >
                    {page + 1}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextGroup}
                  disabled={!canGoNextGroup()}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* 파티 추가 모달 */}
            {showAddModal && (
              <AddPartyModal
                onClose={() => setShowAddModal(false)}
                onSuccess={() => {
                  setShowAddModal(false)
                  loadParties(0) // 첫 페이지로 이동
                }}
              />
            )}
          </div>
        </main>
      </div>
    </>
  )
} 