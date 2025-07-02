export enum PartyStatus {
  RECRUITING = 'RECRUITING',
  COMPLETED = 'COMPLETED'
}

export interface Party {
  id?: string
  title: string
  status: PartyStatus
  description: string
  location: string
  date: string // ISO string
  maxMembers?: number
  currentMembers: number
  tags: string[]
  nickname: string
  createdAt: string
  dDay?: number
}

export interface PartyCreateRequest {
  title: string
  description: string
  location: string
  date: string // ISO string
  maxMembers: number
  tags: string[]
  nickname: string
  password: string
}

export interface PartyUpdateRequest {
  title: string
  description: string
  location: string
  date: string // ISO string
  maxMembers?: number
  tags: string[]
  status?: PartyStatus
}

export interface PartyMember {
  id?: string
  nickname: string
  isCreator: boolean
  joinedAt: string
}

export interface PartyMemberRequest {
  nickname: string
  password: string
}

export interface PartyListResponse {
  content: Party[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  numberOfElements: number
  first: boolean
  last: boolean
} 