import axios from 'axios'

// 개발 환경에서는 백엔드 서버 직접 연결, 배포 환경에서는 환경 변수 사용
const baseURL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000' // 개발 환경에서는 백엔드 서버로 직접 연결
  : (process.env.NEXT_PUBLIC_API_URL || 'https://virtue-project.info')

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
}) 