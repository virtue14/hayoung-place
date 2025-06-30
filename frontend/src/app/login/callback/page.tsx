'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, initialize } = useAuthStore()

  useEffect(() => {
    const accessToken = searchParams.get('accessToken')
    const refreshToken = searchParams.get('refreshToken')

    // 프로덕션에서는 토큰 로깅 제거
    if (process.env.NODE_ENV === 'development') {
      console.log('Callback Page - Tokens received')
    }

    if (accessToken && refreshToken) {
      // 토큰을 저장하고 인증 상태를 초기화
      login(accessToken, refreshToken)
      
      // 사용자 정보를 가져오고 리다이렉트
      initialize().then(() => {
        router.push('/')
      }).catch((error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to initialize user:', error)
        }
        router.push('/login')
      })
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.error('No tokens found in callback')
      }
      router.push('/login')
    }
  }, [router, searchParams, login, initialize])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold">로그인 처리 중...</h2>
        <p className="mt-2 text-gray-600">잠시만 기다려주세요.</p>
      </div>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">로그인 처리 중...</h2>
          <p className="mt-2 text-gray-600">잠시만 기다려주세요.</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
} 