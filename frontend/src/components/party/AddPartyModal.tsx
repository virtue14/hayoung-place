'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Minus } from 'lucide-react'
import { partyApi } from '@/lib/api/party'
import { PartyCreateRequest } from '@/types/party'

interface AddPartyModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function AddPartyModal({ onClose, onSuccess }: AddPartyModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    maxMembers: '',
    tags: [] as string[],
    nickname: '',
    password: ''
  })

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, index) => index !== indexToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim() || 
        !formData.location.trim() || !formData.date || 
        !formData.maxMembers || !formData.nickname.trim() || !formData.password.trim()) {
      setError('모든 필수 필드를 입력해주세요.')
      return
    }

    // 날짜가 과거인지 확인
    const selectedDate = new Date(formData.date)
    const now = new Date()
    if (selectedDate <= now) {
      setError('미래 날짜를 선택해주세요.')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const request: PartyCreateRequest = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        date: new Date(formData.date).toISOString(),
        maxMembers: parseInt(formData.maxMembers),
        tags: formData.tags,
        nickname: formData.nickname.trim(),
        password: formData.password.trim()
      }

      await partyApi.createParty(request)
      onSuccess()
    } catch (err: unknown) {
      console.error('파티 생성 실패:', err)
      setError(err instanceof Error ? err.message : '파티 생성에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">파티 만들기</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              파티 제목 <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="파티 제목을 입력하세요"
              maxLength={100}
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              파티 설명 <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="파티에 대한 자세한 설명을 입력하세요"
              rows={3}
              maxLength={500}
            />
          </div>

          {/* 장소 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              파티 장소 <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="만날 장소를 입력하세요"
              maxLength={200}
            />
          </div>

          {/* 날짜 및 시간 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              파티 일시 <span className="text-red-500">*</span>
            </label>
            <Input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          {/* 최대 인원 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              모집 인원 <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.maxMembers}
              onValueChange={(value) => handleInputChange('maxMembers', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="모집 인원을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2명 (파티장 포함)</SelectItem>
                <SelectItem value="3">3명 (파티장 포함)</SelectItem>
                <SelectItem value="4">4명 (파티장 포함)</SelectItem>
                <SelectItem value="5">5명 (파티장 포함)</SelectItem>
                <SelectItem value="6">6명 (파티장 포함)</SelectItem>
                <SelectItem value="7">7명 (파티장 포함)</SelectItem>
                <SelectItem value="8">8명 (파티장 포함)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 태그 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              파티 태그
            </label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="태그를 입력하세요"
                maxLength={20}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="hover:text-blue-800"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 닉네임 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              닉네임 <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.nickname}
              onChange={(e) => handleInputChange('nickname', e.target.value)}
              placeholder="혼동 방지를위해 이름 입력하세요"
              maxLength={20}
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호 <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="파티 수정/삭제 시 사용할 비밀번호"
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">
              파티 수정 및 삭제 시 필요합니다.
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? '생성 중...' : '파티 만들기'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 