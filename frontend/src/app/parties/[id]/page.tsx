'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Users, Calendar, MapPin, Crown, ArrowLeft, Trash2, UserPlus, UserMinus, Edit } from 'lucide-react'
import { partyApi } from '@/lib/api/party'
import { Party, PartyStatus, PartyMember } from '@/types/party'
import EditPartyModal from '@/components/party/EditPartyModal'
import Link from 'next/link'

export default function PartyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [party, setParty] = useState<Party | null>(null)
  const [members, setMembers] = useState<PartyMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 모달 상태
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  
  // 폼 데이터
  const [joinForm, setJoinForm] = useState({ nickname: '', password: '' })
  const [leaveForm, setLeaveForm] = useState({ nickname: '', password: '' })
  const [deletePassword, setDeletePassword] = useState('')
  const [closeForm, setCloseForm] = useState({ nickname: '', password: '' })
  
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const loadPartyData = async () => {
    try {
      setIsLoading(true)
      const [partyData, membersData] = await Promise.all([
        partyApi.getParty(params.id as string),
        partyApi.getPartyMembers(params.id as string)
      ])
      setParty(partyData)
      setMembers(membersData)
    } catch (err) {
      setError('파티 정보를 불러오는데 실패했습니다.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      loadPartyData()
    }
  }, [params.id])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'long'
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

  const handleJoin = async () => {
    if (!joinForm.nickname.trim() || !joinForm.password.trim()) {
      setActionError('닉네임과 비밀번호를 입력해주세요.')
      return
    }

    try {
      setActionLoading(true)
      setActionError(null)
      await partyApi.joinParty(params.id as string, joinForm)
      setShowJoinModal(false)
      setJoinForm({ nickname: '', password: '' })
      await loadPartyData() // 데이터 새로고침
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : '파티 참여에 실패했습니다.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleLeave = async () => {
    if (!leaveForm.nickname.trim() || !leaveForm.password.trim()) {
      setActionError('닉네임과 비밀번호를 입력해주세요.')
      return
    }

    try {
      setActionLoading(true)
      setActionError(null)
      await partyApi.leaveParty(params.id as string, leaveForm.nickname, leaveForm.password)
      setShowLeaveModal(false)
      setLeaveForm({ nickname: '', password: '' })
      await loadPartyData() // 데이터 새로고침
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : '파티 탈퇴에 실패했습니다.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deletePassword.trim()) {
      setActionError('비밀번호를 입력해주세요.')
      return
    }

    try {
      setActionLoading(true)
      setActionError(null)
      await partyApi.deleteParty(params.id as string, deletePassword)
      router.push('/parties')
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : '파티 삭제에 실패했습니다.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleClose = async () => {
    if (!closeForm.nickname.trim() || !closeForm.password.trim()) {
      setActionError('닉네임과 비밀번호를 입력해주세요.')
      return
    }

    try {
      setActionLoading(true)
      setActionError(null)
      await partyApi.closeParty(params.id as string, closeForm.nickname, closeForm.password)
      setShowCloseModal(false)
      setCloseForm({ nickname: '', password: '' })
      await loadPartyData() // 데이터 새로고침
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : '파티 마감에 실패했습니다.')
    } finally {
      setActionLoading(false)
    }
  }



  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">파티 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !party) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>{error || '파티를 찾을 수 없습니다.'}</p>
          <Link href="/parties">
            <Button className="mt-4">목록으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/parties">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            목록으로
          </Button>
        </Link>
        <div className="flex-1" />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditModal(true)}
          >
            <Edit className="w-4 h-4 mr-1" />
            수정
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            삭제
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 파티 정보 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <CardTitle className="text-2xl font-bold">{party.title}</CardTitle>
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
                {party.dDay !== undefined && (
                  <Badge className={getDDayColor(party.dDay)}>
                    {getDDayText(party.dDay)}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {party.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{party.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>{formatDate(party.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-5 h-5" />
                  <span>
                    {party.currentMembers}
                    {party.maxMembers ? `/${party.maxMembers}` : ''}명
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Crown className="w-5 h-5" />
                  <span>파티장: {party.nickname}</span>
                </div>
              </div>

              {/* 태그 */}
              {party.tags.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">태그</h4>
                  <div className="flex flex-wrap gap-2">
                    {party.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 파티 마감하기 버튼 */}
          {party.status === PartyStatus.RECRUITING && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setShowCloseModal(true)}
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                파티 마감하기
              </Button>
            </div>
          )}
        </div>

        {/* 파티원 목록 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                파티원 ({members.length}명)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* 참여/탈퇴 버튼 */}
              <div className="flex gap-2 justify-center mb-4">
                {party.status === PartyStatus.RECRUITING && (
                  <Button
                    onClick={() => setShowJoinModal(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    파티 참여
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowLeaveModal(true)}
                  size="sm"
                >
                  <UserMinus className="w-4 h-4 mr-1" />
                  파티 탈퇴
                </Button>
              </div>
              <div className="space-y-3">
                {members.map((member, index) => (
                  <div
                    key={member.id || index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{member.nickname}</span>
                        {member.isCreator && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(member.joinedAt).toLocaleDateString('ko-KR')} 참여
                      </p>
                    </div>
                  </div>
                ))}
                {members.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    아직 참여한 파티원이 없습니다.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 파티 참여 모달 */}
      {showJoinModal && (
        <Dialog open={true} onOpenChange={setShowJoinModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>파티 참여</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  닉네임
                </label>
                <Input
                  value={joinForm.nickname}
                  onChange={(e) => setJoinForm(prev => ({ ...prev, nickname: e.target.value }))}
                  placeholder="혼동 방지를위해 이름 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호
                </label>
                <Input
                  type="password"
                  value={joinForm.password}
                  onChange={(e) => setJoinForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="비밀번호를 입력하세요"
                />
              </div>
              {actionError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{actionError}</p>
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowJoinModal(false)
                    setActionError(null)
                  }}
                  className="flex-1"
                  disabled={actionLoading}
                >
                  취소
                </Button>
                <Button
                  onClick={handleJoin}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={actionLoading}
                >
                  {actionLoading ? '참여 중...' : '참여하기'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 파티 탈퇴 모달 */}
      {showLeaveModal && (
        <Dialog open={true} onOpenChange={setShowLeaveModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>파티 탈퇴</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  닉네임
                </label>
                <Input
                  value={leaveForm.nickname}
                  onChange={(e) => setLeaveForm(prev => ({ ...prev, nickname: e.target.value }))}
                  placeholder="혼동 방지를위해 이름 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호
                </label>
                <Input
                  type="password"
                  value={leaveForm.password}
                  onChange={(e) => setLeaveForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="비밀번호를 입력하세요"
                />
              </div>
              {actionError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{actionError}</p>
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowLeaveModal(false)
                    setActionError(null)
                  }}
                  className="flex-1"
                  disabled={actionLoading}
                >
                  취소
                </Button>
                <Button
                  onClick={handleLeave}
                  variant="destructive"
                  className="flex-1"
                  disabled={actionLoading}
                >
                  {actionLoading ? '탈퇴 중...' : '탈퇴하기'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 파티 삭제 모달 */}
      {showDeleteModal && (
        <Dialog open={true} onOpenChange={setShowDeleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>파티 삭제</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                파티를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  파티장 비밀번호
                </label>
                <Input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="파티장 비밀번호를 입력하세요"
                />
              </div>
              {actionError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{actionError}</p>
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setActionError(null)
                    setDeletePassword('')
                  }}
                  className="flex-1"
                  disabled={actionLoading}
                >
                  취소
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="destructive"
                  className="flex-1"
                  disabled={actionLoading}
                >
                  {actionLoading ? '삭제 중...' : '삭제하기'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 파티 마감 모달 */}
      {showCloseModal && (
        <Dialog open={true} onOpenChange={setShowCloseModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>파티 마감</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                파티를 마감하시겠습니까? 마감된 파티는 새로운 참여자를 받을 수 없습니다.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  파티장 닉네임
                </label>
                <Input
                  value={closeForm.nickname}
                  onChange={(e) => setCloseForm(prev => ({ ...prev, nickname: e.target.value }))}
                  placeholder="[파티장] 혼동 방지를위해 이름 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  파티장 비밀번호
                </label>
                <Input
                  type="password"
                  value={closeForm.password}
                  onChange={(e) => setCloseForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="[파티장] 비밀번호를 입력하세요"
                />
              </div>
              {actionError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{actionError}</p>
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCloseModal(false)
                    setActionError(null)
                    setCloseForm({ nickname: '', password: '' })
                  }}
                  className="flex-1"
                  disabled={actionLoading}
                >
                  취소
                </Button>
                <Button
                  onClick={handleClose}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                  disabled={actionLoading}
                >
                  {actionLoading ? '마감 중...' : '마감하기'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 파티 수정 모달 */}
      {party && (
        <EditPartyModal
          party={party}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={loadPartyData}
        />
      )}
    </div>
  )
} 