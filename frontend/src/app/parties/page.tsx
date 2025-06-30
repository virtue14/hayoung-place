'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, MapPin, Calendar, Plus, Clock } from 'lucide-react'
import TabNavigation from '@/components/layout/TabNavigation'

// 임시 파티 데이터 타입
interface Party {
  id: string
  title: string
  description: string
  location: string
  date: string
  time: string
  maxParticipants: number
  currentParticipants: number
  hostName: string
  tags: string[]
  createdAt: string
}

// 임시 파티 데이터
const mockParties: Party[] = [
  {
    id: '1',
    title: '제주도 서쪽 해안 드라이브 함께해요',
    description: '렌터카로 제주도 서쪽 해안을 따라 드라이브하며 맛집과 카페를 탐방할 예정입니다. 사진 찍기 좋아하시는 분들 환영!',
    location: '제주시 출발',
    date: '2024-01-15',
    time: '10:00',
    maxParticipants: 4,
    currentParticipants: 2,
    hostName: '여행러버',
    tags: ['드라이브', '맛집', '사진'],
    createdAt: '2024-01-10T09:00:00Z'
  },
  {
    id: '2',
    title: '한라산 등반 파티 모집',
    description: '한라산 정상까지 함께 등반할 동행을 찾습니다. 등반 경험이 있으신 분들과 함께하고 싶어요.',
    location: '한라산 어리목 탐방로',
    date: '2024-01-20',
    time: '06:00',
    maxParticipants: 6,
    currentParticipants: 3,
    hostName: '산악인',
    tags: ['등산', '한라산', '새벽'],
    createdAt: '2024-01-08T14:30:00Z'
  },
  {
    id: '3',
    title: '제주 전통시장 투어',
    description: '동문시장과 중앙지하상가에서 제주 특산품과 로컬 음식을 함께 맛보실 분들을 모집합니다.',
    location: '제주시 동문시장',
    date: '2024-01-18',
    time: '15:00',
    maxParticipants: 5,
    currentParticipants: 1,
    hostName: '로컬가이드',
    tags: ['전통시장', '음식', '쇼핑'],
    createdAt: '2024-01-09T11:15:00Z'
  }
]

export default function PartiesPage() {
  const [parties] = useState<Party[]>(mockParties)

  const getStatusColor = (current: number, max: number) => {
    const ratio = current / max
    if (ratio >= 1) return 'text-red-600 bg-red-100'
    if (ratio >= 0.8) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const getStatusText = (current: number, max: number) => {
    if (current >= max) return '모집완료'
    return '모집중'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 고정 헤더 */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-sm z-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">파티모집</h1>
            <Button 
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

               <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-[104px] sm:pt-[112px] pb-6 sm:pb-8">
         {/* 파티 수 */}
         <div className="mb-4 sm:mb-6 mt-4 sm:mt-6">
          <span className="text-sm sm:text-base font-semibold text-gray-700">
            총 {parties.length}개의 파티
          </span>
        </div>

        {/* 파티 목록 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {parties.map((party) => (
            <Card key={party.id} className="overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-1 border border-gray-200 rounded-lg sm:rounded-xl cursor-pointer">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-base sm:text-lg font-bold text-gray-900 leading-tight flex-1 mr-2">
                    {party.title}
                  </CardTitle>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${getStatusColor(party.currentParticipants, party.maxParticipants)}`}>
                    {getStatusText(party.currentParticipants, party.maxParticipants)}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 pt-0">
                {/* 설명 */}
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-3">
                  {party.description}
                </p>
                
                {/* 위치 */}
                <div className="flex items-center space-x-2 text-gray-600 text-sm mb-2">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  <span className="line-clamp-1">{party.location}</span>
                </div>
                
                {/* 날짜 및 시간 */}
                <div className="flex items-center space-x-2 text-gray-600 text-sm mb-2">
                  <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  <span>{new Date(party.date).toLocaleDateString('ko-KR')}</span>
                  <Clock className="h-4 w-4 flex-shrink-0 text-gray-400 ml-2" />
                  <span>{party.time}</span>
                </div>
                
                {/* 참가자 수 */}
                <div className="flex items-center space-x-2 text-gray-600 text-sm mb-3">
                  <Users className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  <span>{party.currentParticipants}/{party.maxParticipants}명</span>
                </div>
                
                {/* 태그 */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {party.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                
                {/* 하단 정보 */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    by {party.hostName}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(party.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* 빈 상태 */}
        {parties.length === 0 && (
          <div className="text-center py-12 sm:py-16 text-gray-500">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <p className="text-sm sm:text-base">모집 중인 파티가 없습니다.</p>
              <Button 
                variant="outline"
                size="sm"
                className="mt-2"
              >
                첫 번째 파티 만들기
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 