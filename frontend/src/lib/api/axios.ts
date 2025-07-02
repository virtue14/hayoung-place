import axios from 'axios'

// 개발 환경에서는 Next.js 프록시 사용, 배포 환경에서는 직접 API 호출
const baseURL = process.env.NODE_ENV === 'development' 
  ? '' // 개발 환경에서는 상대 경로로 프록시 사용
  : (process.env.NEXT_PUBLIC_API_URL || 'https://virtue-project.info')

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
}) 