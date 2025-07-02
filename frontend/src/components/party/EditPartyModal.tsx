'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { partyApi } from '@/lib/api/party'
import { Party } from '@/types/party'

interface EditPartyModalProps {
  party: Party
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface EditPartyForm {
  title: string
  description: string
  location: string
  date: string
  maxMembers: number
  tags: string[]
  password: string
}

export default function EditPartyModal({ party, isOpen, onClose, onSuccess }: EditPartyModalProps) {
  const [form, setForm] = useState<EditPartyForm>({
    title: '',
    description: '',
    location: '',
    date: '',
    maxMembers: 2,
    tags: [],
    password: ''
  })
  
  const [tagInput, setTagInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 파티 정보로 폼 초기화
  useEffect(() => {
    if (party && isOpen) {
      const partyDate = new Date(party.date)
      const formattedDate = partyDate.toISOString().slice(0, 16)
      
      setForm({
        title: party.title,
        description: party.description,
        location: party.location,
        date: formattedDate,
        maxMembers: party.maxMembers || 2,
        tags: [...party.tags],
        password: ''
      })
    }
  }, [party, isOpen])

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !form.tags.includes(tag) && form.tags.length < 5) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.title.trim() || !form.description.trim() || !form.location.trim() || !form.date || !form.password.trim()) {
      setError('모든 필수 항목을 입력해주세요.')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      if (!party.id) {
        setError('파티 ID가 유효하지 않습니다.')
        return
      }

      await partyApi.updateParty(party.id, {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        date: form.date,
        maxMembers: form.maxMembers,
        tags: form.tags
      }, form.password)
      
      onSuccess()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '파티 수정에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setForm({
      title: '',
      description: '',
      location: '',
      date: '',
      maxMembers: 2,
      tags: [],
      password: ''
    })
    setTagInput('')
    setError(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>파티 수정</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목 <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="파티 제목을 입력하세요"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명 <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="파티에 대한 설명을 입력하세요"
              rows={4}
              maxLength={1000}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              위치 <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.location}
              onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
              placeholder="모임 장소를 입력하세요"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              날짜/시간 <span className="text-red-500">*</span>
            </label>
            <Input
              type="datetime-local"
              value={form.date}
              onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
              min={new Date().toISOString().slice(0, 16)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              최대 인원 <span className="text-red-500">*</span>
            </label>
            <Select 
              value={form.maxMembers.toString()} 
              onValueChange={(value) => setForm(prev => ({ ...prev, maxMembers: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="인원을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}명
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              태그 (최대 5개)
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="태그를 입력하고 Enter를 누르세요"
                maxLength={20}
              />
              <Button
                type="button"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || form.tags.length >= 5}
                variant="outline"
              >
                추가
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 text-sm rounded-full"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              파티장 비밀번호 <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
              placeholder="파티장 비밀번호를 입력하세요"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
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
              {isLoading ? '수정 중...' : '수정하기'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 