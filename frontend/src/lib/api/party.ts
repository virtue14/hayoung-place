import { api } from './axios'
import { Party, PartyCreateRequest, PartyUpdateRequest, PartyMember, PartyMemberRequest, PartyListResponse } from '@/types/party'

export const partyApi = {
  // 파티 목록 조회
  getParties: async (page: number = 0, size: number = 5): Promise<PartyListResponse> => {
    const response = await api.get(`/parties?page=${page}&size=${size}`)
    return response.data
  },

  // 파티 상세 조회
  getParty: async (id: string): Promise<Party> => {
    const response = await api.get(`/parties/${id}`)
    return response.data
  },

  // 파티 생성
  createParty: async (data: PartyCreateRequest): Promise<Party> => {
    const response = await api.post('/parties', data)
    return response.data
  },

  // 파티 수정
  updateParty: async (id: string, data: PartyUpdateRequest, password: string): Promise<Party> => {
    const response = await api.put(`/parties/${id}`, data, {
      headers: {
        'X-Password': password
      }
    })
    return response.data
  },

  // 파티 삭제
  deleteParty: async (id: string, password: string): Promise<void> => {
    await api.delete(`/parties/${id}`, {
      data: { password }
    })
  },

  // 파티 참여
  joinParty: async (id: string, data: PartyMemberRequest): Promise<PartyMember> => {
    const response = await api.post(`/parties/${id}/join`, data)
    return response.data
  },

  // 파티 탈퇴
  leaveParty: async (id: string, nickname: string, password: string): Promise<void> => {
    await api.delete(`/parties/${id}/leave?nickname=${nickname}`, {
      data: { password }
    })
  },

  // 파티원 목록 조회
  getPartyMembers: async (id: string): Promise<PartyMember[]> => {
    const response = await api.get(`/parties/${id}/members`)
    return response.data
  },

  closeParty: async (id: string, nickname: string, password: string): Promise<Party> => {
    const response = await api.patch(`/parties/${id}/close?nickname=${nickname}`, {
      password
    })
    return response.data
  }
} 